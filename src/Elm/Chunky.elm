module Chunky exposing (..)

import Html exposing (Html)
import Html.Attributes


slab node attributes classes =
    node (class classes :: attributes)


brick =
    slab Html.div


chunk =
    brick []


class =
    String.join " " >> Html.Attributes.class
