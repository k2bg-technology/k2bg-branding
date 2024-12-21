import { ImageViewer } from 'ui';

import { type MediaImage } from '../../modules/interfaces/media/validator';

interface MediaImageProps {
  mediaImage: MediaImage;
}

export function MediaImage(props: MediaImageProps) {
  const { mediaImage } = props;

  return (
    <div className="mt-4">
      <ImageViewer
        id={mediaImage.id}
        name={mediaImage.name}
        url={mediaImage.sourceUrl}
        file={mediaImage.sourceFile}
        width={mediaImage.width}
        height={mediaImage.height}
        unoptoinized={mediaImage.extension === '.gif'}
      />
    </div>
  );
}
