export default function createPageUrl(page, id) {
  if (page === 'laporan') return `/laporan/${id}`;
  return '/';
}
