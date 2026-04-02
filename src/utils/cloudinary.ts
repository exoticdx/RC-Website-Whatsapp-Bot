export function getCloudinaryUrl(publicId: string, options: { width?: number; height?: number; crop?: string } = {}) {
  const baseUrl = "https://res.cloudinary.com/demo/image/upload"; // Placeholder cloud name
  const transformations = [];
  
  if (options.width) transformations.push(`w_${options.width}`);
  if (options.height) transformations.push(`h_${options.height}`);
  if (options.crop) transformations.push(`c_${options.crop}`);
  
  const transformationString = transformations.length > 0 ? transformations.join(',') + '/' : '';
  
  return `${baseUrl}/${transformationString}${publicId}`;
}
