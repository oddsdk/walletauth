module Main exposing (main)

import Browser
import Chunky exposing (..)
import Html
import Html.Attributes as A
import Html.Events as E
import Ports
import RemoteData exposing (RemoteData(..))
import Return exposing (return)



-- 🚀


main : Program {} Model Msg
main =
    Browser.element
        { init = init
        , view = view
        , update = update
        , subscriptions = subscriptions
        }



-- 🏔


type alias Model =
    { hasFissionAccount : RemoteData String Bool }


init : {} -> ( Model, Cmd Msg )
init _ =
    Return.singleton
        { hasFissionAccount = NotAsked
        }



-- 📣


type Msg
    = Bypassed
      --
    | HasFissionAccount
    | ReplyForHasFissionAccount Bool


update msg model =
    case msg of
        Bypassed ->
            Return.singleton model

        --
        HasFissionAccount ->
            ( model, Ports.hasFissionAccount () )

        ReplyForHasFissionAccount bool ->
            Return.singleton { model | hasFissionAccount = Success bool }



-- 📰


subscriptions _ =
    Sub.batch
        [ Ports.replyForHasFissionAccount ReplyForHasFissionAccount ]



-- 🎨


view model =
    slab
        Html.main_
        []
        [ "max-w-7xl", "mx-auto", "py-16", "px-4", "sm:py-24", "sm:px-6", "lg:px-8" ]
        [ case model.hasFissionAccount of
            NotAsked ->
                signIn

            Loading ->
                loading

            Success hasFissionAccount ->
                Html.text ""

            Failure err ->
                errorView err
        ]



--


button attributes =
    slab
        Html.button
        (A.type_ "button"
            :: A.class "inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :: attributes
        )
        []


errorView err =
    chunk
        [ "text-red-600" ]
        [ Html.text err ]


loading =
    chunk
        [ "italic" ]
        [ Html.text "Just a moment" ]


modal =
    brick
        [ A.class "fixed z-10 inset-0 overflow-y-auto"
        , A.attribute "aria-labelledby" "modal-title"
        , A.attribute "role" "dialog"
        , A.attribute "aria-modal" "true"
        ]
        []
        [ brick
            [ A.class "flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0" ]
            []
            [ -- Background overlay, show/hide based on modal state.
              brick
                [ A.class "fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity"
                , A.attribute "aria-hidden" "true"
                ]
                []
                []

            -- This element is to trick the browser into centering the modal contents.
            , slab
                Html.span
                [ A.class "hidden sm:inline-block sm:align-middle sm:h-screen"
                , A.attribute "aria-hidden" "true"
                ]
                []
                [ Html.text "&#8203;" ]

            -- Modal panel, show/hide based on modal state
            , brick
                [ A.class "relative inline-block align-bottom bg-white rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-sm sm:w-full sm:p-6" ]
                []
                [ chunk
                    []
                    []
                ]
            ]
        ]


signIn =
    chunk
        [ "text-center" ]
        [ button
            [ E.onClick HasFissionAccount ]
            [ Html.text "Connect with Metamask" ]
        ]
