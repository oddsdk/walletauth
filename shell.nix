let

  sources         = import ./nix/sources.nix;
  pkgs            = import sources.unstable {};

in

  pkgs.mkShell {

    buildInputs = [
      pkgs.elmPackages.elm
      pkgs.elmPackages.elm-format
    ];

  }
