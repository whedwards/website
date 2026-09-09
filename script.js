(() => {

  /*
    ========================================
    POSTCARD COLLECTIONS
    ========================================

    Right now we only have one actual postcard
    image.

    When your cards come back, we'll change
    these arrays to five front/back pairs for
    each city.

    Example later:

    {
      front: "assets/postcards/galesburg/1-front.png",
      back: "assets/postcards/galesburg/1-back.png"
    }

  */

  const places = {

    galesburg: {

      name: "Galesburg, Illinois",
      shortName: "Galesburg",

      tz: "America/Chicago",

      lat: 40.9478,
      lon: -90.3712,

      cards: [

        {
          front: "assets/galesburg-front.png",

          /*
            null means use the temporary
            postcard-back drawing for now.
          */
          back: null
        }

      ]

    },


    stanford: {

      name: "Stanford, California",
      shortName: "Stanford",

      tz: "America/Los_Angeles",

      lat: 37.4275,
      lon: -122.1697,

      cards: [

        /*
          Temporary placeholder.

          We can replace this with the real
          Stanford cards when you photograph
          them.
        */

        {
          front: "assets/galesburg-front.png",
          back: null
        }

      ]

    }

  };


  /*
    ========================================
    STATE
    ========================================
  */

  let activePlace = "galesburg";


  /*
    A postcard is chosen only once per city
    during the current page load.

    Therefore:

      Galesburg → Stanford → Galesburg

    returns to the SAME Galesburg postcard.

    Reloading the page advances the deck.
  */

  const sessionCards = {
    galesburg: null,
    stanford: null
  };


  /*
    ========================================
    ELEMENTS
    ========================================
  */

  const postcard =
    document.getElementById("postcard");

  const frontImage =
    document.getElementById("front-image");

  const backImage =
    document.getElementById("back-image");

  const backPlaceholder =
    document.getElementById("back-placeholder");

  const clock =
    document.getElementById("clock");

  const placeOptions =
    document.querySelectorAll(".place-option");


  /*
    ========================================
    SHUFFLE
    ========================================
  */

  function shuffle(array) {

    const copy = [...array];

    for (
      let i = copy.length - 1;
      i > 0;
      i--
    ) {

      const j =
        Math.floor(
          Math.random() * (i + 1)
        );

      [
        copy[i],
        copy[j]
      ] = [
        copy[j],
        copy[i]
      ];

    }

    return copy;

  }


  /*
    ========================================
    DRAW NEXT POSTCARD
    ========================================

    Each city has its own deck stored in the
    visitor's browser.

    Example with five cards:

      4, 1, 5, 2, 3

    A card is removed each time the page is
    loaded.

    Only after the entire deck is exhausted
    is a new random order generated.

    Thus no card repeats before every other
    card in that city has appeared.
  */

  function drawNextCard(placeKey) {

    const place =
      places[placeKey];

    const cards =
      place.cards;


    /*
      If only one postcard currently exists,
      just use it.
    */

    if (cards.length === 1) {
      return cards[0];
    }


    const deckKey =
      `whe-postcard-deck-v1-${placeKey}`;

    const lastKey =
      `whe-postcard-last-v1-${placeKey}`;


    /*
      Signature lets the site notice when
      you've changed the postcard list.

      If you later add/remove cards, an old
      stored deck won't cause problems.
    */

    const signature =
      cards
        .map(card => card.front)
        .join("|");


    let deckData = null;


    try {

      deckData =
        JSON.parse(
          localStorage.getItem(deckKey)
        );

    } catch {

      deckData = null;

    }


    const deckIsInvalid =
      !deckData ||
      deckData.signature !== signature ||
      !Array.isArray(deckData.order) ||
      deckData.order.length === 0;


    /*
      Build a fresh shuffled deck.
    */

    if (deckIsInvalid) {

      let order =
        shuffle(
          cards.map(
            (_, index) => index
          )
        );


      /*
        Also avoid showing the exact same
        postcard twice in a row across the
        boundary between two shuffle cycles.

        Not strictly required, but nicer.
      */

      const previousCard =
        Number(
          localStorage.getItem(lastKey)
        );


      if (
        order.length > 1 &&
        Number.isInteger(previousCard) &&
        order[0] === previousCard
      ) {

        [
          order[0],
          order[1]
        ] = [
          order[1],
          order[0]
        ];

      }


      deckData = {
        signature,
        order
      };

    }


    const cardIndex =
      deckData.order.shift();


    localStorage.setItem(
      deckKey,
      JSON.stringify(deckData)
    );


    localStorage.setItem(
      lastKey,
      String(cardIndex)
    );


    return cards[cardIndex];

  }


  /*
    ========================================
    GET THIS SESSION'S CARD
    ========================================
  */

  function getCardForSession(placeKey) {

    if (!sessionCards[placeKey]) {

      sessionCards[placeKey] =
        drawNextCard(placeKey);

    }

    return sessionCards[placeKey];

  }


  /*
    ========================================
    LIVE CLOCK
    ========================================

    Example:

    Galesburg:: 2026-09-08, 8:41:17 p.m.
  */

  function tick() {

    const place =
      places[activePlace];

    const now =
      new Date();


    const parts =
      new Intl.DateTimeFormat(
        "en-US",
        {

          timeZone:
            place.tz,

          year:
            "numeric",

          month:
            "2-digit",

          day:
            "2-digit",

          hour:
            "numeric",

          minute:
            "2-digit",

          second:
            "2-digit",

          hour12:
            true

        }
      ).formatToParts(now);


    const getPart =
      type =>
        parts.find(
          part =>
            part.type === type
        )?.value || "";


    const year =
      getPart("year");

    const month =
      getPart("month");

    const day =
      getPart("day");

    const hour =
      getPart("hour");

    const minute =
      getPart("minute");

    const second =
      getPart("second");


    const period =
      getPart("dayPeriod") === "AM"
        ? "a.m."
        : "p.m.";


    clock.textContent =
      `${place.shortName} :: ` +
      `${year}-${month}-${day}, ` +
      `${hour}:${minute}:${second} ` +
      `${period}`;

  }


  /*
    ========================================
    LOCATION SWITCH APPEARANCE
    ========================================
  */

  function updatePlaceSwitch() {

    placeOptions.forEach(button => {

      const isActive =
        button.dataset.place ===
        activePlace;


      button.classList.toggle(
        "is-active",
        isActive
      );


      if (isActive) {

        button.setAttribute(
          "aria-current",
          "true"
        );

      } else {

        button.removeAttribute(
          "aria-current"
        );

      }

    });

  }


  /*
    ========================================
    RENDER ACTIVE CITY
    ========================================
  */

  function renderPlace() {

    const place =
      places[activePlace];

    const card =
      getCardForSession(activePlace);


    /*
      Front
    */

    frontImage.src =
      card.front;

    frontImage.alt =
      `Vintage linen postcard from ${place.name}`;


    /*
      Real back image, when available.
    */

    if (card.back) {

      backImage.src =
        card.back;

      backImage.alt =
        `Back of mailed postcard from ${place.name}`;

      backImage.hidden =
        false;

      backPlaceholder.hidden =
        true;

    } else {

      backImage.hidden =
        true;

      backPlaceholder.hidden =
        false;

    }


    /*
      Whenever city changes, show the front.
    */

    postcard.classList.remove(
      "is-flipped"
    );


    postcard.setAttribute(
      "aria-label",
      `Turn ${place.name} postcard over`
    );


    updatePlaceSwitch();

    tick();

  }


  /*
    ========================================
    SET CITY
    ========================================
  */

  function setPlace(placeKey) {

    if (!places[placeKey]) {
      return;
    }

    activePlace =
      placeKey;

    renderPlace();

  }


  /*
    ========================================
    FLIP
    ========================================
  */

  postcard.addEventListener(
    "click",
    () => {

      postcard.classList.toggle(
        "is-flipped"
      );

    }
  );


  /*
    ========================================
    TOP-RIGHT LOCATION SWITCH
    ========================================
  */

  placeOptions.forEach(button => {

    button.addEventListener(
      "click",
      () => {

        setPlace(
          button.dataset.place
        );

      }
    );

  });


  /*
    ========================================
    FOOTER LOCATION LINKS
    ========================================
  */

  document
    .querySelectorAll(".footer-switch")
    .forEach(button => {

      button.addEventListener(
        "click",
        () => {

          setPlace(
            button.dataset.place
          );


          document
            .getElementById("home")
            .scrollIntoView({
              behavior: "smooth"
            });

        }
      );

    });


  /*
    ========================================
    DISTANCE
    ========================================
  */

  function distanceKm(
    lat1,
    lon1,
    lat2,
    lon2
  ) {

    const toRad =
      degrees =>
        degrees *
        Math.PI /
        180;


    const R =
      6371;


    const dLat =
      toRad(
        lat2 - lat1
      );


    const dLon =
      toRad(
        lon2 - lon1
      );


    const a =
      Math.sin(dLat / 2) ** 2 +
      Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) ** 2;


    return (
      2 *
      R *
      Math.asin(
        Math.sqrt(a)
      )
    );

  }


  /*
    ========================================
    INITIAL CITY FROM IP
    ========================================

    No browser geolocation permission.

    If the IP lookup fails, Galesburg is the
    quiet fallback.
  */

  async function determineInitialPlace() {

    try {

      const response =
        await fetch(
          "https://ipwho.is/"
        );


      if (!response.ok) {
        throw new Error();
      }


      const data =
        await response.json();


      if (
        !data ||
        data.success === false ||
        typeof data.latitude !== "number" ||
        typeof data.longitude !== "number"
      ) {

        return "galesburg";

      }


      const galesburg =
        places.galesburg;

      const stanford =
        places.stanford;


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


      return (
        distanceToStanford <
        distanceToGalesburg
      )
        ? "stanford"
        : "galesburg";


    } catch {

      return "galesburg";

    }

  }


  /*
    ========================================
    START
    ========================================
  */

  async function initialize() {

    const initialPlace =
      await determineInitialPlace();


    setPlace(
      initialPlace
    );


    /*
      Update the visible clock every second.
    */

    setInterval(
      tick,
      1000
    );

  }


  initialize();

})();
