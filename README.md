# Dynamic-SVG Token 
Module for Foundry VTT, allows tokens that use SVG images to dynamically fill out text data elements derived from their actor given a valid key.

SVG will require a `dsvg=""` attribute be added to the <SVG> element so the module can easily identify the SVG as as need to dynamically update. Use the standard Foundry notation of `@the.path.to.data` to reference any key value that is exposed to a Tokens Document.

Currently this module is only limited to SVGs used for tokens.
