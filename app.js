var music, 
    s, 
    scalemanager, 
    text, 
    otsikko,
    waveform;

var slices, 
    sprites, 
    stars;

var sine;

var xl;
var cx = 0;

// Luodaan tämän demon peli-instanssi
var game = new Phaser.Game(800,
    600,
    Phaser.WEBGL,
    'body',
    {
        preload: preload,
        create: create,
        update: update
    });


// Ladataan musat ja taustakuva muistiin
function preload() {

    game.load.audio('slowmo', ['assets/slowmo.mp3', 'assets/slowmo.ogg']);
    game.load.image('background', 'assets/background.png');
    
}

/* Luodaan kaikki tarvittava:

- Taustakuva
- Musiikki
- Tekstit
- Tekstin paloittelu efektointia varten
- Tähtitaivas

*/

function create() {
    // Taustakuvan asettaminen
    game.stage.backgroundColor = '#443439'; 
    bg = game.add.tileSprite(0, 0, 800, 600, 'background');

    // Musat päälle
	music = game.add.audio('slowmo');
	music.loop = true;
    music.play();
    
    // Retro frameratet tulille -- Ei toiminut toivotusti?
    game.time.suggestedFps = 10;
        
    // Lisätään otsikko
    otsikko = game.add.text(290, 30, "Phaser.io", {font: 'italic 20pt Times', fontSize: 64, fill: '#ffffff' });
    
    // Laitetaan otsikko välkkymään
    otsikko.alpha = 0;
    game.add.tween(otsikko).to( { alpha: 1 }, 2000, Phaser.Easing.Linear.None, true, 0, 1000, true);
    
    // Tekstin viipaleet ja tähdet taulukkoihin, sekä lisäys peliin
    slices = [];
    stars = [];
    sprites = game.add.spriteBatch();

    // Tekstin viipaloinnin paksuus
    var ys = 1;
    
    // Skrollaava teksti:
    var stringText = "Lorem ipsum, \n dolor sit amet! \n —Julius Caesar 200eaa."
    
    // Tekstin varsinainen viipalointi: 
    for (var y = 0; y < 200; y++)
    {
        var slice = new Phaser.Text(   // Joka viipaleelle uusi teksti
            game, 
            800, 
            100+y*ys, 
            stringText, 
            {   font: 'Helvetica', 
                fontSize: 16, 
                fill: '#aaffaa' 
            }
        ); 
        
        slice.crop(new Phaser.Rectangle(0, ys*y, 800, ys)); // Tässä tapahtuu viipalointi       
        
        // Z erikseen että saadaan myöhemmin päivitettyä skrollaus nätisti
        slice.z = -300+ y*ys;
        
        
        slice.anchor.set(0.5); // Keskitys
        sprites.addChild(slice); // Lisätään peliin
        slices.push(slice); // Sama objekti myös taulukkoon muokattavaksi

    }
    
    
    // Tähti 
    var starData = [
        '.2.',
        '222',
        '.2.'
    ];
    
    game.create.texture('star', starData, 3, 3, 0); // luodaan taulukkodatan pohjalta tähden tekstuuri
    
    starlet = game.add.sprite(-5, -5, 'star'); 
    // nähtävästi peliin on luotava sprite että sen pohjalta voi luoda uusia silmukassa, 
    // ei nyt keksitty muutakaan niin laitetaan piiloon (-5, -5)
    
    var starAmount = 15; // Tähtien määrä 
    
    
    // Tähtitaivaan luonti (randomilla)
    for (var i = 0; i < starAmount; i++)
    {
        
            var x = game.rnd.between(0, 800);
            var y = game.rnd.between(0, 400);
            var star = game.make.sprite(x, y, 'star');

            // Laitetaan tähti tuikkimaan eli vaihtelee läpinäkyvyyttä 0.3-1 välillä. Käytetään phaserin tween-luokkaa.
            star.alpha = 0.3;
            game.add.tween(star).to( { alpha: 1}, 2000, Phaser.Easing.Linear.None, true, x*10, 1000, true);

            sprites.addChild(star);
            stars.push(star);
        
    }

    
    // Luodaan siniaaltotaulu skrollerin aaltoilua varten
    sine = [];
    for (var i = 0; i < 800; i++) {
        sine[i] = 2*Math.sin(i/15);
    }

}

/*

Laitetaan teksti skrollaamaan ja aaltoilemaan.

Teksti on siis viipaloitu vaakasuoriin osiin, joiden sijainti x-akselilla riippuu sinitaulun arvosta y-akselin sijainnin perusteella.

Viipaleen sijainti y-akselilla on viipaleen muuttujan z modulo 400 + 500, eli saa käytännössä arvoja [100..500]

*/

function update() {
    
    for (var len = 0, i = slices.length - 1; i >= len; i--)
    {
        slice = slices[i];
        slice.z--;
        slice.x = Math.floor(sine[slice.y]) + 450;
        slice.y = (slice.z % 400) + 500;
    }
    
}

