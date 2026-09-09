
(() => {
  const places = {
    galesburg: {
      name: "Galesburg, Illinois",
      tz: "America/Chicago",
      lat: 40.9478,
      lon: -90.3712,
      switchLabel: "see Stanford →",
      image: "assets/galesburg-front.png"
    },
    stanford: {
      name: "Stanford, California",
      tz: "America/Los_Angeles",
      lat: 37.4275,
      lon: -122.1697,
      switchLabel: "← see Galesburg",
      image: "assets/galesburg-front.png" // temporary until Stanford scans are added
    }
  };

  let activePlace = "galesburg";
  let cardIndex = 0;

  const postcard = document.getElementById("postcard");
  const frontImage = document.getElementById("front-image");
  const placeName = document.getElementById("place-name");
  const clock = document.getElementById("clock");
  const switchPlace = document.getElementById("switch-place");
  const count = document.getElementById("card-count");

  function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = d => d * Math.PI / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    const a = Math.sin(dLat/2) ** 2 +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
      Math.sin(dLon/2) ** 2;
    return 2 * R * Math.asin(Math.sqrt(a));
  }

  function renderPlace() {
    const p = places[activePlace];
    placeName.textContent = p.name;
    switchPlace.textContent = p.switchLabel;
    frontImage.src = p.image;
    frontImage.alt = `Vintage linen postcard from ${p.name}`;
    postcard.classList.remove("is-flipped");
    postcard.setAttribute("aria-label", `Flip ${p.name} postcard`);
    count.textContent = `${cardIndex + 1} / 5`;
    tick();
  }

  function tick() {
    const p = places[activePlace];
    const now = new Date();
    const formatted = new Intl.DateTimeFormat("en-US", {
      timeZone: p.tz,
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit"
    }).format(now);
    clock.textContent = formatted;
  }

  function setPlace(place) {
    activePlace = place;
    cardIndex = 0;
    renderPlace();
  }

  postcard.addEventListener("click", () => {
    postcard.classList.toggle("is-flipped");
  });

  switchPlace.addEventListener("click", () => {
    setPlace(activePlace === "galesburg" ? "stanford" : "galesburg");
  });

  document.getElementById("prev-card").addEventListener("click", () => {
    cardIndex = (cardIndex + 4) % 5;
    count.textContent = `${cardIndex + 1} / 5`;
    postcard.classList.remove("is-flipped");
  });

  document.getElementById("next-card").addEventListener("click", () => {
    cardIndex = (cardIndex + 1) % 5;
    count.textContent = `${cardIndex + 1} / 5`;
    postcard.classList.remove("is-flipped");
  });

  document.querySelectorAll(".footer-switch").forEach(btn => {
    btn.addEventListener("click", () => {
      setPlace(btn.dataset.place);
      document.getElementById("home").scrollIntoView({behavior: "smooth"});
    });
  });

  setInterval(tick, 1000);

  // Approximate IP-based initial city selection.
  // If the request fails, the site quietly defaults to Galesburg.
  fetch("https://ipwho.is/")
    .then(r => r.ok ? r.json() : Promise.reject())
    .then(data => {
      if (!data || data.success === false || typeof data.latitude !== "number") return;
      const g = places.galesburg;
      const s = places.stanford;
      const dg = distanceKm(data.latitude, data.longitude, g.lat, g.lon);
      const ds = distanceKm(data.latitude, data.longitude, s.lat, s.lon);
      setPlace(ds < dg ? "stanford" : "galesburg");
    })
    .catch(() => renderPlace());

  renderPlace();
})();
