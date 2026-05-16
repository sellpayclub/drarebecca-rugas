import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { fal } from '@fal-ai/client';
import "dotenv/config";

// Setup Fal AI
if (process.env.FAL_KEY) {
  fal.config({ credentials: process.env.FAL_KEY });
} else {
  console.warn("FAL_KEY not set in environment variables.");
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware - increased limit for base64 images from mobile
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // API Route for Fal AI processing
  app.post("/api/transformar", async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    try {
      const { base64Image, type } = req.body;
      
      if (!base64Image) {
        console.error(`[${requestId}] No image in request body. Body keys: ${Object.keys(req.body || {})}`);
        return res.status(400).json({ error: "Nenhuma imagem recebida. Tente novamente." });
      }

      if (typeof base64Image !== 'string') {
        console.error(`[${requestId}] base64Image is not a string, type: ${typeof base64Image}`);
        return res.status(400).json({ error: "Formato de imagem inválido." });
      }

      const payloadSizeKb = Math.round(base64Image.length / 1024);
      console.log(`[${requestId}] Processing image for type: ${type} (Payload: ${payloadSizeKb}KB, starts with: ${base64Image.substring(0, 50)}...)`);

      // 1. Parse the base64 data - handle various mobile formats
      let base64Data: string;
      let mimeType: string = 'image/jpeg';

      if (base64Image.includes(',')) {
        // Standard data URI: data:image/jpeg;base64,/9j/...
        const parts = base64Image.split(',');
        base64Data = parts[1];
        
        // Extract MIME type from header
        const headerMatch = parts[0].match(/data:([^;]+)/);
        if (headerMatch) {
          mimeType = headerMatch[1];
        }
      } else if (base64Image.startsWith('/9j/') || base64Image.startsWith('iVBOR')) {
        // Raw base64 without data URI prefix (some mobile browsers)
        base64Data = base64Image;
        mimeType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        console.log(`[${requestId}] Raw base64 detected (no data: prefix), assuming ${mimeType}`);
      } else {
        console.error(`[${requestId}] Unrecognized image format. First 80 chars: ${base64Image.substring(0, 80)}`);
        return res.status(400).json({ error: "Formato de imagem não reconhecido. Tire outra foto." });
      }

      // Normalize MIME type - mobile can send exotic types
      const mimeNormalization: Record<string, string> = {
        'image/heic': 'image/jpeg',
        'image/heif': 'image/jpeg',
        'image/webp': 'image/webp', // fal supports webp
        'image/jpg': 'image/jpeg',
      };
      const normalizedMime = mimeNormalization[mimeType.toLowerCase()] || mimeType;
      
      if (!base64Data || base64Data.length < 100) {
        console.error(`[${requestId}] Base64 data too short: ${base64Data?.length || 0} chars`);
        return res.status(400).json({ error: "Imagem corrompida. Tire outra foto." });
      }

      // 2. Convert to buffer and create blob for upload
      const buffer = Buffer.from(base64Data, 'base64');
      console.log(`[${requestId}] Buffer size: ${Math.round(buffer.length / 1024)}KB, MIME: ${normalizedMime}`);
      
      if (buffer.length < 1000) {
        console.error(`[${requestId}] Buffer suspiciously small: ${buffer.length} bytes`);
        return res.status(400).json({ error: "Imagem muito pequena ou corrompida. Tire outra foto." });
      }

      // Always upload as JPEG to avoid fal.ai format issues with HEIC etc.
      const blob = new Blob([buffer], { type: normalizedMime });
      const extension = normalizedMime === 'image/png' ? 'png' : 'jpg';
      const file = new File([blob], `img-${Date.now()}.${extension}`, { type: normalizedMime });
      
      console.log(`[${requestId}] Uploading to Fal storage (${Math.round(buffer.length / 1024)}KB as ${extension})...`);
      const imageUrl = await fal.storage.upload(file);
      console.log(`[${requestId}] Image uploaded:`, imageUrl);

      // 3. Setup prompts based on transformation type
      let modificacoes = "";
      if (type === "aging") {
        modificacoes = "identical person, same features. ADD 70% MORE wrinkles: deep crow's feet (pé de galinha), prominent expression lines, nasolabial folds (bigode chinês), and neck wrinkles. Project aging ONLY on skin texture as if neglected. NO new heavy spots, NO change in facial structure. Natural aging projection.";
      } else if (type === "treatment") {
        modificacoes = "identical person, same features. REMOVE 80% of all skin imperfections, wrinkles, and aging signs. Smooth and hydrated skin texture, rejuvenated appearance, well-cared for healthy skin. Keep facial features exactly the same, only youthful skin surface. Radiant and professional finish.";
      }

      const prompt = `Raw high-quality portrait photograph. 
      STRICT PRESERVATION RULE: You must keep 100% of the exact original identity, facial features, and face structure UNCHANGED.
      - FACE STRUCTURE: Jawline, chin shape, face width, and forehead must remain EXACTLY the same.
      - FEATURES: Exact original eyes, gaze, eyebrows, nose shape, and mouth/lips must NOT change.
      - EXPRESSION: The exact same emotion and facial pose.
      ONLY EXCEPTION: Modify ONLY the skin quality according to: ${modificacoes}.
      The requested skin changes must be implemented PRECISELY on the original subject without altering their identity.
      Ensure the result looks completely natural and photorealistic. DO NOT smooth skin like a cheap filter. Keep realistic skin texture.`;

      // 4. Call AI with explicit logging and timeout
      console.log(`[${requestId}] Starting Fal.ai generation (${type})...`);
      
      const generatePromise = fal.subscribe('fal-ai/flux-2-lora-gallery/face-to-full-portrait', {
        input: {
          image_urls: [imageUrl],
          prompt: prompt,
          guidance_scale: 2.5,
          num_inference_steps: 40,
          output_format: 'png',
          num_images: 1,
          lora_scale: 0.85,
        },
        logs: true
      });

      // 90s server-side timeout (increased from 45s for mobile - processing can take longer)
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error("Timeout na geração da IA (90s)")), 90000)
      );

      const result: any = await Promise.race([generatePromise, timeoutPromise]);
      console.log(`[${requestId}] Generation complete!`);
      
      if (!result.data || !result.data.images || result.data.images.length === 0) {
        console.error(`[${requestId}] No images in result:`, JSON.stringify(result).substring(0, 500));
        throw new Error("O motor de IA não retornou imagens.");
      }

      // 5. Return to frontend
      return res.json({ 
        imagemTransformada: result.data.images[0].url 
      });

    } catch (error: any) {
      console.error(`[${requestId}] Error processing image:`, error?.message || error);
      console.error(`[${requestId}] Error stack:`, error?.stack);
      
      // Clean up common error messages for user
      let message = "Erro ao processar imagem. Tente novamente.";
      if (error.message?.includes("Timeout")) message = "O processamento demorou muito. Tente com outra foto ou verifique sua conexão.";
      else if (error.message?.includes("limit")) message = "Limite de processamento atingido. Tente em alguns instantes.";
      else if (error.message?.includes("fal")) message = "Falha na comunicação com o motor de IA. Tente novamente.";
      else if (error.message?.includes("413") || error.message?.includes("too large")) message = "Imagem muito grande. Tente com uma foto menor.";
      else if (error.message?.includes("corrupted") || error.message?.includes("invalid")) message = "Imagem corrompida. Tire outra foto.";
      
      return res.status(500).json({ 
        error: message,
        details: process.env.NODE_ENV === "development" ? error.message : undefined
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
