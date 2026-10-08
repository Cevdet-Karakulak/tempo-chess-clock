/** Prevent repeated taps from starting overlapping exports. */
export function createExportGate() {
  let busy=false;
  return {
    /** @param {()=>Promise<void>} task */
    async run(task) {
      if(busy)return false;
      busy=true;
      try {await task();return true;} finally {busy=false;}
    }
  };
}

export class PhotoPermissionError extends Error {}

/** @param {string} platform @param {number} api */
export function requiresPhotoPermission(platform,api=0) {
  return platform==='ios'||(platform==='android'&&(!Number.isFinite(api)||api<30));
}

/**
 * Keep the temporary PNG until Photos has finished importing it.
 * @param {{permission:()=>Promise<boolean>,capture:()=>Promise<string>,save:(uri:string)=>Promise<void>,release:(uri:string)=>void}} job
 */
export async function savePhoto(job) {
  if(!await job.permission())throw new PhotoPermissionError('Photos permission denied');
  const uri=await job.capture();
  // iOS view-shot returns an absolute filesystem path; Expo expects a file URL.
  const fileUri=uri.startsWith('/')?'file://'+uri:uri;
  try {await job.save(fileUri);} finally {job.release(uri);}
}
