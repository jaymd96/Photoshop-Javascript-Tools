#include util.jsxinc

// Set a script name
var scriptName = {
    en: "example script",
    de: "Beispiel-Skript"
};

//Helper Functions
function readFile(path) {
    var file = new File(path);
    file.open("r");
    var content = file.read();
    file.close();
    return content;
}

function readObjectsFromJson(filename) {
    try {
        var jsonText = readFile(filename);
        var objects = eval("(" + jsonText + ")")
        return objects;
    } catch (e) {
        $.writeln(e);
        return null;
    }
}

function buildFilename(origname, name, index, suffix) {
    var filename = extractFilestart(origname)
    if (index !== undefined) filename += "-gen-" + zeropad(index)
    if (name !== undefined) filename += "-" + filesc(name)
    if (suffix !== undefined) filename += "." + suffix
    return new File(filename);
}

function extractFilestart(origname) {
    return origname.path + "/" + removeFileExtension(origname.name);
}

function filesc(str) {
    return (str + '')
        .toLowerCase()
        .replace('�', 'oe')
        .replace('�', 'ae')
        .replace('�', 'ue')
        .replace('�', 'ss')
        .replace(/[^0-9A-Za-z]+/g, '-')
        .replace(/^-|-$/g, '');
}

function zeropad(n, anz) {
    anz = anz || 5;
    var digitAnz = n == 0 ? 1 : Math.floor(Math.log(n) / Math.log(10)) + 1;
    return new Array(anz - digitAnz + 1).join('0') + n;
}

function removeFileExtension(filename) {
    // http://stackoverflow.com/questions/1818310/regular-expression-to-remove-a-files-extension
    return filename.substr(0, filename.lastIndexOf('.')) || filename;
}

function replaceContents(newFile, theSO) {
    app.activeDocument.activeLayer = theSO;
    var idplacedLayerReplaceContents = stringIDToTypeID("placedLayerReplaceContents");
    var desc3 = new ActionDescriptor();
    var idnull = charIDToTypeID("null");
    desc3.putPath(idnull, new File(newFile));
    var idPgNm = charIDToTypeID("PgNm");
    desc3.putInteger(idPgNm, 1);
    executeAction(idplacedLayerReplaceContents, desc3, DialogModes.NO);
    return app.activeDocument.activeLayer;
};

// Saving options
var psdOpts = new PhotoshopSaveOptions();
var jpgOpts = new JPEGSaveOptions();
jpgOpts.embedColorProfile = true;
jpgOpts.quality = 12; // highest

// File Containing all the Card Data
var cardDataFilePath = "/Users/jamesmason-drust/Desktop/Photoshop-Javascript-Tools/data.json"
var cardData = readObjectsFromJson(cardDataFilePath)

function getImagePath(card) {
    return cardData.imageDir + "/" + card.image
}

var titleTextLayerName = "TitleText"
var abilityTextLayerName = "AbilityText"
var tokenGroupName = "Tokens"
var CardLayerName = "Card"

var data = undefined
var cardIndex = undefined

for (cardIndex = 0; cardIndex < cardData.cards.length; cardIndex++) {
    data = cardData.cards[cardIndex]
    if (app.documents.length > 0) {
        // Layers
        var titleText = activeDocument.artLayers.getByName(titleTextLayerName)
        var abilityText = activeDocument.artLayers.getByName(abilityTextLayerName)
        var cardImage = activeDocument.artLayers.getByName(CardLayerName)

        // Groups
        var tokenGroup = activeDocument.layerSets.getByName(tokenGroupName)

        // Substitute new text
        titleText.textItem.contents = data.name
        abilityText.textItem.contents = data.ability

        // Change Overide Font Size If Needed
        if (data.overideNameFontSize != undefined){
            titleText.textItem.font.size = data.overideNameFontSize
        }
        // Put back to Default if not overidden
        titleText.textItem.font.size = cardData.defaultNameFontSize

        // Disable Visibility for all Tokens 
        for (var tokenIndex = 0; tokenIndex < tokenGroup.artLayers.length; tokenIndex++) {
            tokenGroup.artLayers[tokenIndex].visible = false;
        }

        // Enable This Cards Token
        token = tokenGroup.artLayers.getByName(data.token + "Token")
        token.visible = true

        // Check if layer is Card Background is a SmartObject;
        if (cardImage.kind != "LayerKind.SMARTOBJECT") {
            alert("selected layer is not a smart object")
        } else {
            //Select the Image File;
            var imagePath = getImagePath(data)
            var myFile = File(imagePath);
            if (myFile) {
                // Replace SmartObject
                cardImage = replaceContents(myFile, cardImage);
            }
        }

        activeDocument.saveAs(buildFilename(activeDocument.fullName, data.name, undefined, 'jpg'), jpgOpts, true);
    }
}