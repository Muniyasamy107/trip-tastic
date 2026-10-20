// Current curated road-trip edition: real, fixed stock source. No API key or arbitrary remote URL is accepted.
// See public/media/FOOTAGE-LICENSE.md for provenance and self-hosting instructions.
export const stockFilm=Object.freeze({
 provider:'stock',
 src:'https://videos.pexels.com/video-files/9117219/9117219-hd_1920_1080_25fps.mp4',
 poster:'/media/hero-road-trip-poster.jpg',
 revision:'pexels-9117219-hd-25fps-v1',
 credit:'Syam Krishnan / Pexels',
 source:'https://www.pexels.com/video/a-jeep-moving-on-the-road-9117219/',
});

// Previous user-selected link, retained as opt-in HERO_FILM_PROVIDER=youtube. Embed only: never download/re-host this YouTube film.
export const youtubeFilm=Object.freeze({
 provider:'youtube',
 videoId:'9AJGRwIo66I',
 source:'https://www.youtube.com/watch?v=9AJGRwIo66I',
 title:'South India - 4K Scenic Nature Drone Relaxation Film',
 credit:'The Indian Ambience / YouTube',
 poster:'https://i.ytimg.com/vi/9AJGRwIo66I/hqdefault.jpg',
 revision:'youtube-9AJGRwIo66I-v1',
});
