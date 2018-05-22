var slices, 
    sprites, 
    stars, // tarvittavat taulukot globaalina
    sine;

var time_til_spawn,
    last_spawn_time; // aikamuuttujat tähdenlentoja varten

/*
 * Luodaan tämän demon peli-instanssi
 */ 

var game = new Phaser.Game(800,
    600,
    Phaser.WEBGL,
    'phaser',
    {
        preload: preload,
        create: create,
        update: update
    });


// Ladataan musat, tähti ja taustakuva muistiin
function preload() {
    
    // Tähti 
    var starData = [
        '.2.',
        '222',
        '.2.'
    ];
    game.load.audio('slowmo', ['assets/slowmo.mp3', 'assets/slowmo.ogg']);
    game.load.image('background', 'assets/background.png'); 
    game.load.imageFromTexture('star', starData, 3, 3, 0);
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
	var music = game.add.audio('slowmo');
	music.loop = true;
    music.play();
        
    // Lisätään otsikko
    var otsikko = game.add.text(290, 30, "Phaser.io", {font: 'italic 20pt Times', fontSize: 64, fill: '#ffffff' });
    
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
    
    
    extraStar = game.add.sprite(-10, -10, 'star'); 
    // nähtävästi peliin on luotava sprite että sen pohjalta voi luoda uusia silmukassa, 
    // ei nyt keksitty muutakaan niin laitetaan piiloon (-10, -10)
    
    
   

    var starAmount = 25; // Tähtien määrä 
    
    
    // Tähtitaivaan luonti (randomilla)
    for (var i = 0; i < starAmount; i++)
    {
        
            var x = game.rnd.between(0, 800);
            var y = game.rnd.between(0, 400);
            var star = game.make.sprite(x, y, 'star');

            // Laitetaan tähti tuikkimaan eli vaihtelee läpinäkyvyyttä 0.3-1 välillä. Käytetään phaserin tween-luokkaa.
            star.alpha = 0.3;
            game.add.tween(star).to( { alpha: 1}, 2000, Phaser.Easing.Linear.None, true, game.rnd.between(0,3000), -1, true);

            sprites.addChild(star);
            stars.push(star);
        
    }
    
    // Luodaan siniaaltotaulu skrollerin aaltoilua varten
    sine = [];
    for (var i = 0; i < 800; i++) {
        sine[i] = 2*Math.sin(i/15);
    }
    

    // Tähdenlentojen randomi esiintyminen
    time_til_spawn = Math.random()*3000 + 2000;  //randomi aika 2-5 sek
    last_spawn_time = game.time.time;   
    
} // create() 

/*

Laitetaan teksti skrollaamaan ja aaltoilemaan.

Teksti on siis viipaloitu vaakasuoriin osiin, joiden sijainti x-akselilla riippuu sinitaulun arvosta y-akselin sijainnin perusteella.

Viipaleen sijainti y-akselilla on viipaleen muuttujan z modulo 400 + 500, eli saa käytännössä arvoja [100..500]

Tämän lisäksi luodaan satunnaisia tähdenlentoja 2-5 sekunnin välein

*/

function update() {
    
    for (var len = 0, i = slices.length - 1; i >= len; i--)
    {
        slice = slices[i];
        slice.z--;
        slice.x = Math.floor(sine[slice.y]) + 450;
        slice.y = (slice.z % 400) + 500;
    }
    
    
    // Satunnaisia tähdenlentoja
    var current_time = game.time.time;
    if(current_time - last_spawn_time > time_til_spawn){
        time_til_spawn = Math.random()*3000 + 2000;
        last_spawn_time = current_time;
        spawnShootingStar();
    }
}



// Tähdenlentojen luonti
function spawnShootingStar() {
    var x = game.rnd.between(0, 800); // Lähtöpiste
    var y = game.rnd.between(0, 400);

    var x2 = game.rnd.between(0, 800); // Päätepiste
    var y2 = game.rnd.between(0, 400);
    
    
    var shootingStar = game.make.sprite(x, y, 'star');

    shootingStar.alpha = 0;
    game.add.tween(shootingStar).to( { x: x2, y: y2 }, 2000, Phaser.Easing.Linear.None, true, 0, 0, false); // Liikkuu alkupisteestä päätepisteeseen
    game.add.tween(shootingStar).to( { alpha: 1 }, 1000, Phaser.Easing.Linear.None, true, 0, 0, true); // Fade in & out

    sprites.addChild(shootingStar); // lisäillään spritebatchiin
}
