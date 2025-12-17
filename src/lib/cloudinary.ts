const CLOUD_NAME = 'doidvg0zc';
const UPLOAD_PRESET = 'campusvoice_upload';

export interface CloudinaryUploadResult {
  secure_url: string;
  public_id: string;
  resource_type: string;
  format: string;
}

export async function uploadToCloudinary(
  file: File,
  onProgress?: (progress: number) => void
): Promise<CloudinaryUploadResult> {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);

  return new Promise((resolve, reject) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/auto/upload`);

    if (onProgress) {
      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = Math.round((event.loaded / event.total) * 100);
          onProgress(progress);
        }
      };
    }

    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          const result = JSON.parse(xhr.responseText);
          resolve({
            secure_url: result.secure_url,
            public_id: result.public_id,
            resource_type: result.resource_type,
            format: result.format,
          });
        } catch (error) {
          reject(new Error('Failed to parse upload response'));
        }
      } else {
        reject(new Error(`Upload failed with status ${xhr.status}`));
      }
    };

    xhr.onerror = () => reject(new Error('Upload failed'));
    xhr.send(formData);
  });
}

export function getMediaType(resourceType: string, format: string): 'image' | 'video' | 'audio' | 'pdf' {
  if (resourceType === 'video') return 'video';
  if (resourceType === 'raw' && format === 'pdf') return 'pdf';
  if (format === 'mp3' || format === 'wav' || format === 'ogg' || format === 'm4a') return 'audio';
  return 'image';
}
