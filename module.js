
const MODULE_ID = "svg-token-text"

Hooks.once('setup', async function() {
    console.log("SVG loader started thingy");


});


Hooks.once('ready', () => {
    if(!game.modules.get('lib-wrapper')?.active && game.user.isGM)
        ui.notifications.error("Module XYZ requires the 'libWrapper' module. Please install and activate it.");
});


Hooks.once('init', async function() {
    libWrapper.register(
        MODULE_ID,
        "Token.prototype._draw",
        _drawSVG
    );
});

async function _drawSVG(wrapped){
    // return wrapped();
    
    let src = this.document.texture.src;
    let rgx = new RegExp(`(\\.svg)(\\?.*)?`, "i");
    console.log(src);
    if(!rgx.test(src)){
        return wrapped();
    }

    wrapped();
    this._cleanData();

    // Draw the token as invisible, so it will be safely revealed later
    this.visible = false;

    // Load token texture
    let texture;
    if ( this.isPreview ) texture = this._original.texture?.clone();
    else {
        console.log(this.document.actor.system)
        // texture = await loadTexture(this.document.texture.src, {fallback: CONST.DEFAULT_TOKEN});

        let src = this.document.texture.src;
        // let src = "https://s3-us-west-2.amazonaws.com/s.cdpn.io/106114/bee.svg";

        // const svgData = await fetch(src).then(response => response);
        let svgData = await fetch(src).then(response => response.text());



        // texture = new PIXI.Texture.fromImage('data:image/svg+xml;charset=utf8,' + svgData);
        // const svgData = await fetch(src);
        console.log(svgData)

        svgData = replaceObjectKeys(svgData, this.document.actor);
        let str = `data:image/svg+xml;charset=utf8,` +  svgData;
        console.log(str)
    


        







        //icons/svg/circle.svg
        // texture = await new PIXI.Texture(svgData);
        // texture = await new PIXI.Texture.from('data:image/svg+xml;charset=utf8,<svg xmlns="http://www.w3.org/2000/svg" version="1.0" width="480" height="543.03003" viewBox="0 0 257.002 297.5" xml:space="preserve"><g transform="matrix(0.8526811,0,0,0.8526811,18.930632,21.913299)"><polygon points="8.003,218.496 0,222.998 0,74.497 8.003,78.999 8.003,218.496 "/><polygon points="128.501,287.998 128.501,297.5 0,222.998 8.003,218.496 128.501,287.998 " /><polygon points="249.004,218.496 257.002,222.998 128.501,297.5 128.501,287.998 249.004,218.496 " /><polygon points="249.004,78.999 257.002,74.497 257.002,222.998 249.004,218.496 249.004,78.999 " /><polygon points="128.501,9.497 128.501,0 257.002,74.497 249.004,78.999 128.501,9.497 " /><polygon points="8.003,78.999 0,74.497 128.501,0 128.501,9.497 8.003,78.999 " /></g></svg>');
        
        
        // texture = await new PIXI.Texture.from(str);
        texture = await new PIXI.Texture.from(svgData);
    }

    this.texture = texture;

    // Draw the TokenMesh in the PrimaryCanvasGroup
    this.mesh = canvas.primary.addToken(this);
    // this.#animationAttributes = this.getDisplayAttributes();
    this.animationAttributes = this.getDisplayAttributes();

    // Draw the border frame in the GridLayer
    this.border ||= canvas.grid.borders.addChild(new PIXI.Graphics());

    // Draw Token interface components
    this.bars = this.addChild(this._drawAttributeBars());
    this.tooltip = this.addChild(this._drawTooltip());
    this.effects = this.addChild(new PIXI.Container());

    this.target = this.addChild(new PIXI.Graphics());
    this.nameplate = this.addChild(this._drawNameplate());

    // Draw elements
    this.drawBars();
    await this.drawEffects();

    // Define initial interactivity and visibility state
    this.hitArea = new PIXI.Rectangle(0, 0, this.w, this.h);
    this.buttonMode = true;
}

function replaceObjectKeys(inputString, data) {
    const outputString = inputString.replace(/@([\w.]+)/g, (match, key) => {
      const keys = key.split(".");
      let value = data;
      keys.forEach(k => {
        value = value[k];
      });
      return value;
    });
  
    console.log(outputString)
    return outputString;
}
