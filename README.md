# Dynamic-SVG Token 
Module for Foundry VTT, allows tokens that use SVG images to dynamically fill out text data elements derived from their actor given a valid key.

SVG will require a `dsvg=""` attribute be added to the <SVG> elemnet as a quick idifyer for the module to destiiuse that it needs to dynamicly update a given SVG. Using the Foundry notation of `@the.path.to.data` to refrence any key value that is exposed to a Tokens Document.

Currently this module is only limited to SVGs used for tokens.