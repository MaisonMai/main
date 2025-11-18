import { useEffect } from 'react';

type AdBannerProps = {
  adSlot?: string;
  adFormat?: string;
  adClient?: string;
};

export function AdBanner({
  adClient = 'ca-pub-6093965233467408',
  adSlot = 'XXXXXXXXXX',
  adFormat = 'auto'
}: AdBannerProps) {
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        ((window as any).adsbygoogle = (window as any).adsbygoogle || []).push({});
      }
    } catch (err) {
      console.error('AdSense error:', err);
    }
  }, []);

  return (
    <div className="w-full bg-gray-50 border-t border-gray-200 py-4">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center">
          <ins
            className="adsbygoogle"
            style={{ display: 'block' }}
            data-ad-client={adClient}
            data-ad-slot={adSlot}
            data-ad-format={adFormat}
            data-full-width-responsive="true"
          />
        </div>
      </div>
    </div>
  );
}
