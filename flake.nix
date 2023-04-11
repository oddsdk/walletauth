{
  description = "oddsdk/walletauth";


  # Inputs
  # ======

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-22.05";
    flake-utils.url = "github:numtide/flake-utils";
  };


  # Outputs
  # =======

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.simpleFlake {
      inherit self nixpkgs;
      name = "oddsdk/walletauth";
      shell = ./nix/shell.nix;
    };
}
