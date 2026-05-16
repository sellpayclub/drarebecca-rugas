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

// Prevent server crashes from unhandled errors
process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception (server kept alive):', err.message);
});
process.on('unhandledRejection', (reason) => {
  console.error('[CRITICAL] Unhandled rejection (server kept alive):', reason);
});

// Helper: retry a function up to N times with delay between attempts
async function withRetry<T>(
  fn: () => Promise<T>, 
  maxAttempts: number, 
  delayMs: number, 
  label: string
): Promise<T> {
  let lastError: any;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (err: any) {
      lastError = err;
      console.warn(`[${label}] Attempt ${attempt}/${maxAttempts} failed: ${err.message || err}`);
      if (attempt < maxAttempts) {
        console.log(`[${label}] Waiting ${delayMs}ms before retry...`);
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Middleware
  app.use(express.json({ limit: "25mb" }));
  app.use(express.urlencoded({ extended: true, limit: "25mb" }));

  // Health check endpoint
  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok", timestamp: Date.now() });
  });

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
      console.log(`[${requestId}] Processing image for type: ${type} (Payload: ${payloadSizeKb}KB)`);

      // 1. Parse the base64 data - handle various mobile formats
      let base64Data: string;
      let mimeType: string = 'image/jpeg';

      if (base64Image.includes(',')) {
        const parts = base64Image.split(',');
        base64Data = parts[1];
        const headerMatch = parts[0].match(/data:([^;]+)/);
        if (headerMatch) {
          mimeType = headerMatch[1];
        }
      } else if (base64Image.startsWith('/9j/') || base64Image.startsWith('iVBOR')) {
        base64Data = base64Image;
        mimeType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
        console.log(`[${requestId}] Raw base64 detected, assuming ${mimeType}`);
      } else {
        console.error(`[${requestId}] Unrecognized image format. First 80 chars: ${base64Image.substring(0, 80)}`);
        return res.status(400).json({ error: "Formato de imagem não reconhecido. Tire outra foto." });
      }

      // Normalize MIME type
      const mimeNormalization: Record<string, string> = {
        'image/heic': 'image/jpeg',
        'image/heif': 'image/jpeg',
        'image/webp': 'image/webp',
        'image/jpg': 'image/jpeg',
      };
      const normalizedMime = mimeNormalization[mimeType.toLowerCase()] || mimeType;
      
      if (!base64Data || base64Data.length < 100) {
        console.error(`[${requestId}] Base64 data too short: ${base64Data?.length || 0} chars`);
        return res.status(400).json({ error: "Imagem corrompida. Tire outra foto." });
      }

      // 2. Convert to buffer
      const buffer = Buffer.from(base64Data, 'base64');
      console.log(`[${requestId}] Buffer: ${Math.round(buffer.length / 1024)}KB, MIME: ${normalizedMime}`);
      
      if (buffer.length < 1000) {
        console.error(`[${requestId}] Buffer too small: ${buffer.length} bytes`);
        return res.status(400).json({ error: "Imagem muito pequena ou corrompida. Tire outra foto." });
      }

      // 3. Upload to fal.ai storage (WITH RETRY - upload can fail on slow connections)
      const blob = new Blob([buffer], { type: normalizedMime });
      const extension = normalizedMime === 'image/png' ? 'png' : 'jpg';
      const file = new File([blob], `img-${Date.now()}.${extension}`, { type: normalizedMime });
      
      const imageUrl = await withRetry(
        () => fal.storage.upload(file),
        3, 2000, `${requestId}-upload`
      );
      console.log(`[${requestId}] Image uploaded:`, imageUrl);

      // 4. Setup prompts based on transformation type
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

      // 5. Call fal.ai WITH RETRY (3 attempts, 3s delay between)
      // This is the critical fix - if fal.ai has a momentary issue, we retry automatically
      console.log(`[${requestId}] Starting Fal.ai generation (${type})...`);
      
      const callFalAI = async (): Promise<any> => {
        const generatePromise = fal.subscribe('fal-ai/flux-2-lora-gallery/face-to-full-portrait', {
          input: {
            image_urls: [imageUrl],
            prompt: prompt,
            guidance_scale: 2.5,
            num_inference_steps: 40,
            output_format: 'png',
            num_images: 1,
            lora_scale: 0.85,
            enable_safety_checker: false, // Disable - was potentially blocking face photos
          },
          logs: true,
          onQueueUpdate: (update) => {
            if (update.status === "IN_PROGRESS") {
              const msgs = update.logs?.map((log: any) => log.message).filter(Boolean) || [];
              if (msgs.length > 0) {
                console.log(`[${requestId}] Fal progress: ${msgs[msgs.length - 1]}`);
              }
            }
          }
        });

        // 120s timeout per attempt
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error("Timeout na geração da IA (120s)")), 120000)
        );

        const result: any = await Promise.race([generatePromise, timeoutPromise]);
        
        // Validate result has images
        if (!result?.data?.images || result.data.images.length === 0) {
          console.error(`[${requestId}] No images in result:`, JSON.stringify(result).substring(0, 500));
          throw new Error("O motor de IA não retornou imagens.");
        }

        if (!result.data.images[0]?.url) {
          console.error(`[${requestId}] Image object has no URL:`, JSON.stringify(result.data.images[0]));
          throw new Error("URL da imagem não encontrada na resposta.");
        }

        return result;
      };

      // RETRY: 3 attempts, 3 second delay between retries
      const result = await withRetry(callFalAI, 3, 3000, `${requestId}-generate`);
      console.log(`[${requestId}] Generation complete! Image URL: ${result.data.images[0].url.substring(0, 80)}...`);

      // 6. Return to frontend
      return res.json({ 
        imagemTransformada: result.data.images[0].url 
      });

    } catch (error: any) {
      console.error(`[${requestId}] FINAL ERROR after all retries:`, error?.message || error);
      console.error(`[${requestId}] Error stack:`, error?.stack?.substring(0, 500));
      
      // User-friendly error messages
      let message = "Erro ao processar imagem. Tente novamente.";
      const msg = error?.message?.toLowerCase() || '';
      
      if (msg.includes("timeout")) message = "O processamento demorou muito. Tente com outra foto.";
      else if (msg.includes("limit") || msg.includes("quota") || msg.includes("rate")) message = "Limite de processamento atingido. Tente em 1 minuto.";
      else if (msg.includes("413") || msg.includes("too large") || msg.includes("payload")) message = "Imagem muito grande. Tente com uma foto menor.";
      else if (msg.includes("corrupted") || msg.includes("invalid")) message = "Imagem corrompida. Tire outra foto.";
      else if (msg.includes("url") || msg.includes("retornou")) message = "O motor de IA não retornou resultado. Tente novamente.";
      
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
