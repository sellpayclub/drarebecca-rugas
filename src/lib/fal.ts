import { fal } from '@fal-ai/client';

// Configure fal.ai with API key (injected by Vite at build time)
const FAL_KEY = (process.env as any).FAL_KEY;

if (FAL_KEY) {
  fal.config({ credentials: FAL_KEY });
} else {
  console.error('[fal.ai] FAL_KEY not configured! Image transformation will fail.');
}

// Helper: retry a function up to N times
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
        await new Promise(r => setTimeout(r, delayMs));
      }
    }
  }
  throw lastError;
}

// Helper: preload image URL to ensure it displays instantly
function preloadImage(url: string, timeoutMs = 15000): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const timer = setTimeout(() => {
      // Even if preload times out, the URL is still valid - resolve anyway
      console.warn('[preload] Timeout, proceeding with URL anyway');
      resolve(url);
    }, timeoutMs);

    img.onload = () => {
      clearTimeout(timer);
      resolve(url);
    };
    img.onerror = () => {
      clearTimeout(timer);
      // Image URL might still work in an <img> tag, don't reject
      console.warn('[preload] Failed to preload, proceeding anyway');
      resolve(url);
    };
    img.crossOrigin = 'anonymous';
    img.src = url;
  });
}

// Helper: make error messages user-friendly in Portuguese
function friendlyError(err: any): string {
  const msg = (err?.message || '').toLowerCase();
  
  if (msg.includes('timeout') || msg.includes('timed out'))
    return 'O processamento demorou muito. Tente novamente.';
  if (msg.includes('rate') || msg.includes('limit') || msg.includes('quota') || msg.includes('429'))
    return 'Muitos acessos simultâneos. Aguarde 30 segundos e tente novamente.';
  if (msg.includes('network') || msg.includes('fetch') || msg.includes('failed to fetch'))
    return 'Falha na conexão. Verifique sua internet e tente novamente.';
  if (msg.includes('key') || msg.includes('auth') || msg.includes('credential') || msg.includes('401') || msg.includes('403'))
    return 'Erro de autenticação com o serviço de IA. Contate o suporte.';
  if (msg.includes('retornou') || msg.includes('images'))
    return 'A IA não retornou resultado. Tente com outra foto bem iluminada.';
  
  return err?.message || 'Erro inesperado. Tente novamente.';
}

export interface TransformResult {
  imageUrl: string;
}

/**
 * Transform a face image using fal.ai - called directly from the browser.
 * Handles: base64 → fal storage upload → AI generation → preload → result URL
 * Includes: 3x retry on upload, 3x retry on generation, image preloading
 */
export async function transformImage(
  base64Image: string,
  type: 'aging' | 'treatment' | 'yoga_aging' | 'yoga_treatment'
): Promise<TransformResult> {
  const requestId = Math.random().toString(36).substring(7);

  try {
    // 1. Parse base64 to blob for upload
    let base64Data: string;
    let mimeType: string = 'image/jpeg';

    if (base64Image.includes(',')) {
      const parts = base64Image.split(',');
      base64Data = parts[1];
      const headerMatch = parts[0].match(/data:([^;]+)/);
      if (headerMatch) mimeType = headerMatch[1];
    } else {
      base64Data = base64Image;
      mimeType = base64Image.startsWith('/9j/') ? 'image/jpeg' : 'image/png';
    }

    // Normalize MIME
    const normalization: Record<string, string> = {
      'image/heic': 'image/jpeg',
      'image/heif': 'image/jpeg',
      'image/jpg': 'image/jpeg',
    };
    mimeType = normalization[mimeType.toLowerCase()] || mimeType;

    // Convert to binary
    const binaryStr = atob(base64Data);
    const bytes = new Uint8Array(binaryStr.length);
    for (let i = 0; i < binaryStr.length; i++) {
      bytes[i] = binaryStr.charCodeAt(i);
    }

    const extension = mimeType === 'image/png' ? 'png' : 'jpg';
    const blob = new Blob([bytes], { type: mimeType });
    const file = new File([blob], `img-${Date.now()}.${extension}`, { type: mimeType });

    console.log(`[${requestId}] Uploading ${Math.round(bytes.length / 1024)}KB ${extension} to fal storage...`);

    // 2. Upload to fal storage (with retry)
    const imageUrl = await withRetry(
      () => fal.storage.upload(file),
      3, 2000, `${requestId}-upload`
    );
    console.log(`[${requestId}] Uploaded:`, imageUrl);

    // 3. Build prompt
    let modificacoes = "";
    if (type === "aging") {
      modificacoes = "identical person, same features. ADD 70% MORE wrinkles: deep crow's feet (pé de galinha), prominent expression lines, nasolabial folds (bigode chinês), and neck wrinkles. Project aging ONLY on skin texture as if neglected. NO new heavy spots, NO change in facial structure. Natural aging projection.";
    } else if (type === "treatment") {
      modificacoes = "identical person, same features. REMOVE 80% of all skin imperfections, wrinkles, and aging signs. Smooth and hydrated skin texture, rejuvenated appearance, well-cared for healthy skin. Keep facial features exactly the same, only youthful skin surface. Radiant and professional finish.";
    } else if (type === "yoga_aging") {
      modificacoes = "identical person, same features. ENHANCE signs of MUSCLE WEAKNESS and GRAVITATIONAL SAGGING: visibly drooping cheeks, heavy sagging eyelids, loose sagging jawline losing definition, deepened nasolabial folds (bigode chinês), sagging neck with loose platysma muscle, forehead lines from weak frontalis muscle. Emphasize gravitational aging effects from weakened facial muscles. The face should look like it is 'falling' due to muscle atrophy. NO skin disease, NO spots. Natural muscle-aging sagging appearance.";
    } else if (type === "yoga_treatment") {
      modificacoes = "identical person, same features. Show a LIFTED, TONED, FIRM facial appearance as if facial muscles have been strengthened and reactivated: elevated high cheekbones, sharply defined jawline and chin, wide open bright youthful eyes with lifted eyelids, smooth forehead, firm toned neck with clean jawline angle, significantly reduced nasolabial folds. Skin looks healthy firm and glowing from strong muscle support underneath. Natural youthful but completely realistic appearance. Radiant healthy finish.";
    }

    const prompt = `Raw high-quality portrait photograph. 
    STRICT PRESERVATION RULE: You must keep 100% of the exact original identity, facial features, and face structure UNCHANGED.
    - FACE STRUCTURE: Jawline, chin shape, face width, and forehead must remain EXACTLY the same.
    - FEATURES: Exact original eyes, gaze, eyebrows, nose shape, and mouth/lips must NOT change.
    - EXPRESSION: The exact same emotion and facial pose.
    ONLY EXCEPTION: Modify ONLY the skin quality according to: ${modificacoes}.
    The requested skin changes must be implemented PRECISELY on the original subject without altering their identity.
    Ensure the result looks completely natural and photorealistic. DO NOT smooth skin like a cheap filter. Keep realistic skin texture.`;

    // 4. Call fal.ai (with retry - 3 attempts)
    console.log(`[${requestId}] Starting fal.ai generation (${type})...`);

    const callFalAI = async (): Promise<any> => {
      const result = await fal.subscribe('fal-ai/flux-2-lora-gallery/face-to-full-portrait', {
        input: {
          image_urls: [imageUrl],
          prompt: prompt,
          guidance_scale: 2.5,
          num_inference_steps: 40,
          output_format: 'png',
          num_images: 1,
          lora_scale: 0.85,
          enable_safety_checker: false,
        },
        logs: true,
        onQueueUpdate: (update) => {
          if (update.status === "IN_PROGRESS") {
            const msgs = update.logs?.map((log: any) => log.message).filter(Boolean) || [];
            if (msgs.length > 0) {
              console.log(`[${requestId}] Progress: ${msgs[msgs.length - 1]}`);
            }
          }
        }
      });

      if (!result?.data?.images || result.data.images.length === 0 || !result.data.images[0]?.url) {
        console.error(`[${requestId}] Invalid result:`, JSON.stringify(result).substring(0, 300));
        throw new Error("O motor de IA não retornou imagens.");
      }

      return result;
    };

    const result = await withRetry(callFalAI, 3, 3000, `${requestId}-generate`);
    const resultUrl = result.data.images[0].url;
    console.log(`[${requestId}] Generation done! Preloading image...`);

    // 5. Preload the result image so it displays instantly (no broken image)
    await preloadImage(resultUrl);
    console.log(`[${requestId}] Image preloaded and ready!`);

    return { imageUrl: resultUrl };

  } catch (err: any) {
    // Wrap with friendly Portuguese message
    const friendly = friendlyError(err);
    console.error(`[${requestId}] Final error:`, err.message || err);
    throw new Error(friendly);
  }
}
