import client from '../api/client';

// Get all berita
export const fetchAllBerita = async () => {
  try {
    const response = await client.get('/api/berita');
    return response.data.data || [];
  } catch (error) {
    console.error('Error fetching berita:', error);
    throw error;
  }
};

// Get single berita
export const fetchBeritaById = async (id) => {
  try {
    const response = await client.get(`/api/berita/${id}`);
    return response.data.data;
  } catch (error) {
    console.error('Error fetching berita:', error);
    throw error;
  }
};

// Create berita
export const createBerita = async (caption, imageFile, publishedAt) => {
  try {
    const form = new FormData();
    form.append('caption', caption);
    form.append('image', imageFile);
    form.append('publishedAt', publishedAt);
    const response = await client.post('/api/berita', form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error creating berita:', error);
    throw error;
  }
};

// Update berita
export const updateBerita = async (id, caption, imageFileOptional, publishedAt) => {
  try {
    const form = new FormData();
    form.append('caption', caption);
    if (imageFileOptional) form.append('image', imageFileOptional);
    form.append('publishedAt', publishedAt);
    const response = await client.put(`/api/berita/${id}`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data.data;
  } catch (error) {
    console.error('Error updating berita:', error);
    throw error;
  }
};

// Delete berita
export const deleteBerita = async (id) => {
  try {
    const response = await client.delete(`/api/berita/${id}`);
    return response.data;
  } catch (error) {
    console.error('Error deleting berita:', error);
    throw error;
  }
};
