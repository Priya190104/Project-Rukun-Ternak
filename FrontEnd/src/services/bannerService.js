import client from '../api/client';

export async function fetchAllBanners() {
  try {
    const res = await client.get('/api/banners/admin/all');
    return Array.isArray(res.data?.data) ? res.data.data : [];
  } catch (error) {
    console.error('Error fetching banners:', error);
    throw error;
  }
}

export async function createBanner(imageFile) {
  try {
    const formData = new FormData();
    formData.append('image', imageFile);

    const res = await client.post('/api/banners', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });

    return res.data?.data;
  } catch (error) {
    console.error('Error creating banner:', error);
    throw error;
  }
}

export async function updateBanner(id, isActive) {
  try {
    const res = await client.put(`/api/banners/${id}`, { isActive });
    return res.data?.data;
  } catch (error) {
    console.error('Error updating banner:', error);
    throw error;
  }
}

export async function deleteBanner(id) {
  try {
    const res = await client.delete(`/api/banners/${id}`);
    return res.data;
  } catch (error) {
    console.error('Error deleting banner:', error);
    throw error;
  }
}
