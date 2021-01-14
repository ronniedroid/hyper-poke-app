import { app, text } from "hyperapp";
import { button, div, input, p, a, figure, img } from "@hyperapp/html";
import { request } from "@hyperapp/http";
import { pushUrl, onUrlChange } from "./navigation";

const BASE_URL =
  location.protocol +
  "//" +
  location.hostname +
  (location.port ? ":" + location.port : "");

const pokemonFromUrl = (url) => {
  let name = url.replace(BASE_URL, "");
  if (!name || name === "/") return null;
  return name.substr(1);
};

const goToPokemonUrl = (name) => pushUrl([BASE_URL + "/" + name]);
const goToMenu = () => pushUrl([BASE_URL]);

const columnsView = (...elm) =>
  div(
    {
      class: {
        columns: true,
        "is-centered": true,
        "is-mobile": true,
        "mt-3": true,
      },
    },
    [...elm]
  );

const GotPokemons = (state, data) => ({
  ...state,
  fetching: false,
  pokemons: data.results,
});

const SetWord = (state, event) => ({ ...state, word: event.target.value });

const updatePokemon = (word, poc) => {
  if (!word) {
    return [];
  }
  return poc.filter((item) => item.name.includes(word));
};

const ClickPokemon = (state, event) => [
  { ...state, word: "" },
  goToPokemonUrl(event.target.textContent),
];

const FetchPokemon = (state, name) => [
  { ...state, fetching: true },
  request({
    url: `https://pokeapi.co/api/v2/pokemon/${name}`,
    expect: "json",
    action: GotPokemon,
  }),
];

const GotPokemon = (state, data) => ({
  ...state,
  fetching: false,
  pokemon: data,
  viewing: true,
});

const ShowMenu = (state) => [state, goToMenu()];

const HandleUrl = (state, url) => {
  const name = pokemonFromUrl(url);
  if (name) return [FetchPokemon, name];
  return {
    ...state,
    viewing: false,
  };
};

app({
  init: [
    {
      pokemons: [],
      pokemon: [],
      word: "",
      fetching: true,
      viewwing: false,
    },
    request({
      url: "https://pokeapi.co/api/v2/pokemon?offset=0",
      expect: "json",
      action: GotPokemons,
    }),
  ],
  subscriptions: (state) => [state.pokemons.length && onUrlChange(HandleUrl)],
  view: ({ pokemons, pokemon, word, viewing }) =>
    div(
      {
        class:
          "container is-flex mt-6 is-flex-direction-column is-justify-content-center",
      },
      [
        columnsView(
          a(
            {
              class:
                "column is-one-thir is-size-3 has-text-centered has-text-primary mb-6",
              onclick: ShowMenu,
            },
            [text("Pockemon Picker")]
          )
        ),
        viewing
          ? div({ class: "container" }, [
              div({ class: "box has-background-grey-lighter" }, [
                columnsView(
                  p(
                    {
                      class: "column is-size-4 has-text-centered is-uppercase",
                    },
                    [text(pokemon.name)]
                  )
                ),
                columnsView(
                  figure({ class: "image is-128x128" }, [
                    img({ src: pokemon.sprites.back_shiny }),
                  ]),
                  figure({ class: "image is-128x128" }, [
                    img({ src: pokemon.sprites.front_shiny }),
                  ])
                ),
                columnsView(
                  p(
                    {
                      class:
                        "is-size-5 has-text-centered has-text-primary-dark",
                    },
                    [text("Types")]
                  )
                ),
                div({ class: "has-text-centered" }, [
                  p(
                    {},
                    pokemon.types.map((item) => p({}, [text(item.type.name)]))
                  ),
                ]),
              ]),
            ])
          : columnsView(
              input(
                {
                  class: "column is-one-third",
                  type: "text",
                  value: word,
                  placeholder: "Search Pockemon Here",
                  oninput: SetWord,
                },
                []
              )
            ),
        div(
          { class: "columns is-multiline is-mobile mt-3 mx-2" },
          updatePokemon(word, pokemons).map((item) =>
            button(
              {
                class: "button is-text column",
                onclick: ClickPokemon,
              },
              [text(item.name)]
            )
          )
        ),
      ]
    ),
  node: document.getElementById("app"),
});
