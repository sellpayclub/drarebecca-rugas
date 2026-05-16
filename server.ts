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
    try {
      const { base64Image, type } = req.body;
      
      if (!base64Image) {
        return res.status(400).json({ error: "No image provided" });
      }

      console.log(`Processing image for type: ${type}`);

      // 1. Convert and upload to fal.ai storage
      const base64Data = base64Image.split(',')[1];
      const mimeType = base64Image.split(';')[0].split(':')[1] || 'image/jpeg';
      const buffer = Buffer.from(base64Data, 'base64');
      const blob = new Blob([buffer], { type: mimeType });
      const file = new File([blob], `img-${Date.now()}.jpg`, { type: mimeType });
      
      const imageUrl = await fal.storage.upload(file);
      console.log("Image uploaded to Fal storage:", imageUrl);

      // 2. Setup prompts based on transformation type
      let modificacoes = "";
      if (type === "aging") {
        modificacoes = "realistic natural skin aging, moderate loss of skin elasticity, appearance of subtle fine lines and wrinkles, natural age spots, realistically aged by 5 years, slightly uneven skin tone. DO NOT EXAGGERATE. VERY NATURAL.";
      } else if (type === "treatment") {
        modificacoes = "premium aesthetic clinic treatment results, extremely well-cared mature skin, highly hydrated glowing skin, firm skin, perfectly even skin tone, elegant and natural rejuvenation, healthy radiant skin texture. DO NOT EXAGGERATE. VERY NATURAL.";
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
      console.log("Starting Fal.ai generation...");
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

      console.log("Generation complete!");
      
      // 4. Return to frontend
      return res.json({ 
        imagemTransformada: result.data.images[0].url 
      });

    } catch (error: any) {
      console.error("Error generating image:", error);
      return res.status(500).json({ error: error.message || "Erro ao gerar imagem" });
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
