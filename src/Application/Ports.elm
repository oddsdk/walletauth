port module Ports exposing (..)

-- 📣


port hasFissionAccount : () -> Cmd msg



-- 📰


port replyForHasFissionAccount : (Bool -> msg) -> Sub msg
