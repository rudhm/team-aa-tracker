const fs = require('fs');
let css = fs.readFileSync('src/app/globals.css', 'utf-8');

css = css.replace(
  `  body {
    @apply text-foreground;
    background-color: #fffdf2; 
    background: linear-gradient(
        to bottom, 
        #fffdf2 0%,   /* Pale cream at the very top */
        #ffdf59 35%,  /* Vibrant yellow in the upper-middle */
        #ff8c3b 75%,  /* Warm orange in the lower-middle */
        #b23b8c 100%  /* Pinkish-purple at the bottom edge */
    );
    background-attachment: fixed;
    min-height: 100vh;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }`,
  `  body {
    @apply text-foreground bg-background;
    background-attachment: fixed;
    min-height: 100vh;
    margin: 0;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }
  
  body:not(.dark) {
    background-color: #fffdf2; 
    background: linear-gradient(
        to bottom, 
        #fffdf2 0%,
        #ffdf59 35%,
        #ff8c3b 75%,
        #b23b8c 100%
    );
    background-attachment: fixed;
  }
  
  body.dark {
    background-color: #0d1117;
    background: linear-gradient(
        to bottom,
        #0d1117 0%,
        #161b22 35%,
        #24152f 75%,
        #3b1b36 100%
    );
    background-attachment: fixed;
  }`
);

fs.writeFileSync('src/app/globals.css', css);
