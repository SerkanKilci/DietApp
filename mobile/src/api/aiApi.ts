import { apiClient } from './client';
import { AnalyzePlateResponse } from './types';

interface PickedImage {
  uri: string;
  name: string;
  type: string;
  /** Web'de expo-image-picker gerçek bir File nesnesi de döner — varsa onu kullanmak daha güvenilir. */
  file?: Blob;
}

export const aiApi = {
  analyzePlate: (image: PickedImage) => {
    const formData = new FormData();
    if (image.file) {
      formData.append('image', image.file, image.name);
    } else {
      // Native (iOS/Android): dosya bir { uri, name, type } objesi olarak eklenir, RN'in
      // fetch/FormData polyfill'i bunu tanır.
      formData.append('image', { uri: image.uri, name: image.name, type: image.type } as unknown as Blob);
    }

    return apiClient
      .post<AnalyzePlateResponse>('/api/ai/analyze-plate', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      .then((res) => res.data);
  },
};
