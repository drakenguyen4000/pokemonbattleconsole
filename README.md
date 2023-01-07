# Pokemon Battle Console - Javascript

### Project Description
- This is a game created by me based on Pokemon games.  All sprites are properties of Pokemon and Nintendo.  This app is to show my coding skills and not for monetary gains.   
- This app is single player vs computer battle.  Players select 3 Pokemon for battle to face off a randomly Pokemon.  Currently, it takes two battle wins to complete the game.  
- Players can switch Pokemon during battle.  Helper items like potion and Pokeball can be used up to 5 per battle.  
- The app is written with mobile first and BEM CSS style based off of wireframes I designed in Figma.  
- The app uses Javascript, CSS and HTML.  
### My motivation for this app?
- My motivation is to wow recruiters with my creativity, coding skills, and design.  I wanted a big project where they can see my abilities with DOM manipulation, mobile first design, and BEM CSS style. 
### Why build this project?
-  I wanted a project that is unique compared to what is usually built.  I liked the concept of Pokemon battles and wanted to challenge myself to see if I could build it similar to a Gameboy console but designed based off of a PokeDex (Pokemon catalogue device).

### What did you learn?
- I learned to work with wireframe app Figma and build a truely mobile first app.
- I got more indepth working with DOM maniupation and iframes.  

### What issues did I run into when building this app?  
#### Trying to setup how to add 3 Pokemon and be able to switch them out during battle.
- Solution: Store 3 selected Pokemon in an array yourPkmn, display Pokemon from that list directly instead of pushing out into a separate property.  This easures all Pokemon's health leave remain as it was left between battle switches.  
#### Trying to get fonts inside an iframe be responsive (adjust size) when the page changes size.  
- Solution: Turns out the solution is modifying the media query to match the new size of the iframe, not the parent html.

 
### How to Install and Run the Project? 
1. Go to project on Github: 
2. You can download the zip file or forking.  
3. Once you have the files, find and open index.html.
4. If opened from desktop, it's best to set it one of the mobile size in your browser.  Look for your responsive design in your browser settings.  

### Setting Up localhost on Mobile Device.  
1. In your laptop, change the internet/network from public to private.  
  In Windows 11:
    Open Settings.
    Click on Network & internet.
    Click the Wi-Fi page on the right side.
    Click the Manage known networks setting.
    Click the active wireless connection.
    Under the “Network profile type” section, select the profile type, including Public or Private.
2. In your phone or tablet, make sure it's selected to the same internet/network.  
3. In Visual Studio code, download Live Service plugin, in index.html file right and select "Open Live Server"
4. Get laptop ip address, command prompt "ipconfig" > IPv4 address
5. On mobile browser, go to "ipv4address:3000" 
	for example:192.168.6.11:3000
	or 192.168.1.6:5500/client/index.html


