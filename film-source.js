// Public, fixed stock source. No API key or arbitrary remote URL is accepted.
// See public/media/FOOTAGE-LICENSE.md for provenance and self-hosting instructions.
export const stockFilm=Object.freeze({
 src:'https://videos.pexels.com/video-files/9117219/9117219-hd_1920_1080_25fps.mp4',
 poster:'/media/hero-road-trip-poster.jpg',
 revision:'pexels-9117219-hd-25fps-v1',
 credit:'Syam Krishnan / Pexels',
 source:'https://www.pexels.com/video/a-jeep-moving-on-the-road-9117219/',
});

// User-selected link. Embed only: never download/re-host this YouTube film.
export const youtubeFilm=Object.freeze({
 provider:'youtube',
 videoId:'AXvVH8CeViI',
 source:'https://www.youtube.com/watch?v=AXvVH8CeViI',
 title:'Above & Beyond - Landrover New Zealand 4K',
 credit:'Jason Charles Hill / YouTube',
 poster:'/media/youtube-road-trip-poster.jpg',
 revision:'youtube-AXvVH8CeViI-v1',
});
