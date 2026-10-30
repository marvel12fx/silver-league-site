import { useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import type { ProductVideo } from '@/lib/types';
import { Upload, Trash2, Play } from 'lucide-react';

const MAX_VIDEO_BYTES = 50 * 1024 * 1024;
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export function ProductVideoManager({ productId }: { productId: string }) {
  const [videos, setVideos] = useState<ProductVideo[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const loadVideos = async () => {
    const { data, error: err } = await supabase
      .from('product_videos')
      .select('*')
      .eq('product_id', productId)
      .order('sort_order', { ascending: true });
    if (err) {
      setError(err.message);
      return;
    }
    setVideos((data as ProductVideo[]) ?? []);
  };

  useEffect(() => {
    loadVideos();
  }, [productId]);

  const handleUpload = async (file: File) => {
    setError(null);
    if (!ALLOWED_TYPES.includes(file.type)) {
      setError('Please upload an MP4, WebM or QuickTime video.');
      return;
    }
    if (file.size > MAX_VIDEO_BYTES) {
      setError('Videos must be 50 MB or smaller.');
      return;
    }
    setUploading(true);
    const ext = file.name.split('.').pop() ?? 'mp4';
    const storagePath = `${productId}/${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const { error: uploadError } = await supabase.storage
      .from('product-videos')
      .upload(storagePath, file, { contentType: file.type });
    if (uploadError) {
      setError(`Upload failed: ${uploadError.message}`);
      setUploading(false);
      return;
    }
    const { data: urlData } = supabase.storage.from('product-videos').getPublicUrl(storagePath);
    const { error: insertError } = await supabase.from('product_videos').insert({
      product_id: productId,
      url: urlData.publicUrl,
      storage_path: storagePath,
      sort_order: videos.length,
    });
    if (insertError) {
      await supabase.storage.from('product-videos').remove([storagePath]);
      setError(`Could not save the video: ${insertError.message}`);
    }
    await loadVideos();
    setUploading(false);
  };

  const handleDelete = async (video: ProductVideo) => {
    setError(null);
    const { error: deleteError } = await supabase.from('product_videos').delete().eq('id', video.id);
    if (deleteError) {
      setError(`Could not remove the video: ${deleteError.message}`);
      return;
    }
    await supabase.storage.from('product-videos').remove([video.storage_path]);
    await loadVideos();
  };

  return (
    <div>
      <label className="block text-[10px] tracking-luxe uppercase text-silver-dark mb-2">Product Videos</label>
      <p className="text-xs text-silver-dark mb-3">Videos appear in the product gallery after the photos. They never play automatically and customers press play themselves.</p>
      <div
        onClick={() => !uploading && fileInputRef.current?.click()}
        className="border-2 border-dashed border-gray-300 p-6 text-center cursor-pointer hover:border-burgundy transition-colors"
      >
        <Upload size={24} className="text-silver mx-auto mb-2" />
        <p className="text-sm text-burgundy-dark">{uploading ? 'Uploading video...' : 'Click to upload a video'}</p>
        <p className="text-xs text-silver-dark mt-1">MP4, WebM or QuickTime, up to 50 MB</p>
      </div>
      <input
        ref={fileInputRef}
        type="file"
        accept="video/mp4,video/webm,video/quicktime"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) handleUpload(file);
          e.target.value = '';
        }}
        className="hidden"
      />
      {error && <p className="text-xs text-red-700 mt-2">{error}</p>}
      {videos.length > 0 && (
        <div className="grid grid-cols-2 gap-3 mt-3">
          {videos.map((video, i) => (
            <div key={video.id} className="relative group border border-gray-200 bg-burgundy-dark h-24 flex items-center justify-center">
              <Play size={22} className="text-cream fill-cream" />
              <span className="absolute bottom-1 left-2 text-[10px] text-cream">Video {i + 1}</span>
              <button
                type="button"
                onClick={() => handleDelete(video)}
                aria-label={`Delete video ${i + 1}`}
                className="absolute top-1 right-1 bg-burgundy text-cream w-6 h-6 flex items-center justify-center opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity"
              >
                <Trash2 size={12} />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
