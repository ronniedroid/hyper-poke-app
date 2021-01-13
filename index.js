import { app, text } from "hyperapp";
import { button, div, input, p, a, figure, img } from "@hyperapp/html";
import { request } from "@hyperapp/http";

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

const GetPokemon = (state, event) => [
  {
    ...state,
    word: "",
  },
  request({
    url: `https://pokeapi.co/api/v2/pokemon/${event.target.textContent}`,
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

const SetViewing = (state) => ({
  ...state,
  viewing: false,
});

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
              onclick: SetViewing,
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
                onclick: GetPokemon,
              },
              [text(item.name)]
            )
          )
        ),
      ]
    ),
  node: document.getElementById("app"),
});
