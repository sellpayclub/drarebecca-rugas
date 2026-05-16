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

  // Middleware
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ extended: true, limit: "50mb" }));

  // API Route for Fal AI processing
  app.post("/api/transformar", async (req, res) => {
    const requestId = Math.random().toString(36).substring(7);
    try {
      const { base64Image, type } = req.body;
      
      if (!base64Image) {
        return res.status(400).json({ error: "No image provided" });
      }

      const payloadSizeKb = Math.round(base64Image.length / 1024);
      console.log(`[${requestId}] Processing image for type: ${type} (Payload: ${payloadSizeKb}KB)`);

      // 1. Convert and upload to fal.ai storage
      const parts = base64Image.split(',');
      if (parts.length < 2) {
        throw new Error("Invalid base64 image format");
      }
      const base64Data = parts[1];
      const mimeType = parts[0].split(';')[0].split(':')[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mimeType });
      const file = new File([blob], `img-${Date.now()}.jpg`, { type: mimeType });
      
      console.log(`[${requestId}] Uploading to Fal storage...`);
      const imageUrl = await fal.storage.upload(file);
      console.log(`[${requestId}] Image uploaded:`, imageUrl);

      // 2. Setup prompts based on transformation type
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

      // 3. Call AI
      console.log(`[${requestId}] Starting Fal.ai generation...`);
      const result = await fal.subscribe('fal-ai/flux-2-lora-gallery/face-to-full-portrait', {
        input: {
          image_urls: [imageUrl],
          prompt: prompt,
          guidance_scale: 2.5,
          num_inference_steps: 40,
          output_format: 'png',
          num_images: 1,
          lora_scale: 0.85,
        }
      });

      console.log(`[${requestId}] Generation complete!`);
      
      if (!result.data || !result.data.images || result.data.images.length === 0) {
        throw new Error("No images returned from Fal.ai");
      }

      // 4. Return to frontend
      return res.json({ 
        imagemTransformada: result.data.images[0].url 
      });

    } catch (error: any) {
      console.error(`[${requestId}] Error processing image:`, error);
      // Clean up common error messages for user
      let message = "Erro ao processar imagem";
      if (error.message?.includes("limit")) message = "Limite de processamento atingido. Tente em alguns instantes.";
      if (error.message?.includes("fal")) message = "Falha na comunicação com o motor de IA.";
      
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
