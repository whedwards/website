(() => {
  const places = {
    galesburg: {
      name: "Galesburg, Illinois",
      shortName: "Galesburg",
      tz: "America/Chicago",
      lat: 40.9478,
      lon: -90.3712,
      switchLabel: "see Stanford →",
      image: "assets/galesburg-front.png"
    },

    stanford: {
      name: "Stanford, California",
      shortName: "Stanford",
      tz: "America/Los_Angeles",
      lat: 37.4275,
      lon: -122.1697,
      switchLabel: "← see Galesburg",

      // Temporary until you add a Stanford postcard image
      image: "assets/galesburg-front.png"
    }
  };


  let activePlace = "galesburg";
  let cardIndex = 0;


  const postcard = document.getElementById("postcard");
  const frontImage = document.getElementById("front-image");
  const clock = document.getElementById("clock");
  const switchPlace = document.getElementById("switch-place");
  const count = document.getElementById("card-count");
  const prevCard = document.getElementById("prev-card");
  const nextCard = document.getElementById("next-card");


  /* =========================
     DISTANCE
     Used to decide whether the
     visitor is closer to Stanford
     or Galesburg.
     ========================= */

  function distanceKm(lat1, lon1, lat2, lon2) {
    const toRad = degrees => degrees * Math.PI / 180;
    const R = 6371;

    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;

    return 2 * R * Math.asin(Math.sqrt(a));
  }


  /* =========================
     LIVE CLOCK
     Example:

     Galesburg:: 2026-09-08, 8:24:15 p.m.
     ========================= */

  function tick() {
    const p = places[activePlace];
    const now = new Date();

    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone: p.tz,
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "numeric",
      minute: "2-digit",
      second: "2-digit",
      hour12: true
    }).formatToParts(now);

    const getPart = type =>
      parts.find(part => part.type === type)?.value || "";

    const year = getPart("year");
    const month = getPart("month");
    const day = getPart("day");

    const hour = getPart("hour");
    const minute = getPart("minute");
    const second = getPart("second");

    const dayPeriod =
      getPart("dayPeriod") === "AM"
        ? "a.m."
        : "p.m.";

    clock.textContent =
      `${p.shortName}:: ${year}-${month}-${day}, ` +
      `${hour}:${minute}:${second} ${dayPeriod}`;
  }


  /* =========================
     RENDER CITY
     ========================= */

  function renderPlace() {
    const p = places[activePlace];

    frontImage.src = p.image;
    frontImage.alt =
      `Vintage linen postcard from ${p.name}`;

    switchPlace.textContent = p.switchLabel;

    postcard.classList.remove("is-flipped");

    postcard.setAttribute(
      "aria-label",
      `Flip ${p.name} postcard`
    );

    count.textContent =
      `${cardIndex + 1} / 5`;

    tick();
  }


  /* =========================
     SWITCH CITY
     ========================= */

  function setPlace(place) {
    activePlace = place;
    cardIndex = 0;
    renderPlace();
  }


  /* =========================
     FLIP POSTCARD
     ========================= */

  postcard.addEventListener("click", () => {
    postcard.classList.toggle("is-flipped");
  });


  /* =========================
     Galesburg / Stanford switch
     ========================= */

  switchPlace.addEventListener("click", () => {
    if (activePlace === "galesburg") {
      setPlace("stanford");
    } else {
      setPlace("galesburg");
    }
  });


  /* =========================
     POSTCARD SELECTOR
     ========================= */

  prevCard.addEventListener("click", () => {
    cardIndex = (cardIndex + 4) % 5;

    count.textContent =
      `${cardIndex + 1} / 5`;

    postcard.classList.remove("is-flipped");
  });


  nextCard.addEventListener("click", () => {
    cardIndex = (cardIndex + 1) % 5;

    count.textContent =
      `${cardIndex + 1} / 5`;

    postcard.classList.remove("is-flipped");
  });


  /* =========================
     FOOTER CITY LINKS
     ========================= */

  document
    .querySelectorAll(".footer-switch")
    .forEach(button => {

      button.addEventListener("click", () => {
        setPlace(button.dataset.place);

        document
          .getElementById("home")
          .scrollIntoView({
            behavior: "smooth"
          });
      });

    });


  /* =========================
     UPDATE CLOCK EVERY SECOND
     ========================= */

  setInterval(tick, 1000);


  /* =========================
     INITIAL PAGE
     ========================= */

  renderPlace();


  /* =========================
     APPROXIMATE IP LOCATION

     No browser location prompt.
     If this fails, Galesburg
     simply remains the default.
     ========================= */

  fetch("https://ipwho.is/")
    .then(response => {
      if (!response.ok) {
        throw new Error("Location lookup failed");
      }

      return response.json();
    })

    .then(data => {
      if (
        !data ||
        data.success === false ||
        typeof data.latitude !== "number" ||
        typeof data.longitude !== "number"
      ) {
        return;
      }

      const galesburg = places.galesburg;
      const stanford = places.stanford;

      const distanceToGalesburg =
        distanceKm(
          data.latitude,
          data.longitude,
          galesburg.lat,
          galesburg.lon
        );

      const distanceToStanford =
        distanceKm(
          data.latitude,
          data.longitude,
          stanford.lat,
          stanford.lon
        );

      if (distanceToStanford < distanceToGalesburg) {
        setPlace("stanford");
      } else {
        setPlace("galesburg");
      }
    })

    .catch(() => {
      // Do nothing.
      // Galesburg remains the default.
    });

})();
