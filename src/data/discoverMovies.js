const DISCOVER_COUNT = 20;

const CATALOG = [
  {
    genre: "Action",
    ids: ["tt0468569", "tt1392190", "tt2911666", "tt0103064", "tt1745960"],
  },
  {
    genre: "Adventure",
    ids: ["tt0082971", "tt0107290", "tt0120737", "tt0076759", "tt0499549"],
  },
  {
    genre: "Comedy",
    ids: ["tt0107048", "tt2278388", "tt0377092", "tt0088763", "tt1049413"],
  },
  {
    genre: "Drama",
    ids: ["tt0111161", "tt0109835", "tt0068646", "tt0108052", "tt2582802"],
  },
  {
    genre: "Science Fiction",
    ids: ["tt1375666", "tt0816692", "tt0133093", "tt2543164", "tt1160419"],
  },
  {
    genre: "Horror",
    ids: ["tt5052448", "tt0081505", "tt1457767", "tt7784604", "tt0054215"],
  },
  {
    genre: "Animation",
    ids: ["tt0245429", "tt0114709", "tt4633694", "tt2380307", "tt0910970"],
  },
  {
    genre: "Romance",
    ids: ["tt3783958", "tt0332280", "tt0112471", "tt0120338", "tt0093779"],
  },
  {
    genre: "Thriller",
    ids: ["tt0102926", "tt0114369", "tt2267998", "tt1392214", "tt0482571"],
  },
  {
    genre: "Crime",
    ids: ["tt0110912", "tt0099685", "tt0113277", "tt0407887", "tt6751668"],
  },
];

let discoverCache = null;

function shuffle(items) {
  const next = [...items];

  for (let index = next.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(Math.random() * (index + 1));
    [next[index], next[swapIndex]] = [next[swapIndex], next[index]];
  }

  return next;
}

function pickDiscoverIds() {
  const used = new Set();
  const picks = [];

  shuffle(CATALOG).forEach((group) => {
    const id = shuffle(group.ids).find((candidate) => !used.has(candidate));
    if (!id) {
      return;
    }
    used.add(id);
    picks.push(id);
  });

  const remaining = shuffle(
    CATALOG.flatMap((group) => group.ids).filter((id) => !used.has(id)),
  );

  remaining.forEach((id) => {
    if (picks.length >= DISCOVER_COUNT || used.has(id)) {
      return;
    }
    used.add(id);
    picks.push(id);
  });

  return shuffle(picks);
}

export function getDiscoverSelection() {
  if (!discoverCache) {
    discoverCache = { ids: pickDiscoverIds(), movies: null };
  }

  return discoverCache;
}

export function saveDiscoverMovies(movies) {
  if (discoverCache) {
    discoverCache.movies = movies;
  }
}
