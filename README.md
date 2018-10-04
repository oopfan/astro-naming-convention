# astro-naming-convention
Astrophotographers amass large numbers of files in pursuit of their passion. As I enter my second year in this hobby I recognize the importance of file naming. As a result I developed this NodeJS application to ensure file name consistency. Please know that I am not forcing my conventions on you. I developed this application to be flexible so as to meet everyone's needs.

## The importance of good file names
Good file names perform two important tasks. The first gives you a quick overview of what that file contains. The second enables it to coexist with other similar but different files in the same directory.

An example would be a file like "Capture_0001.png". What does it say about its contents? Not much except that it is the first in a series of captures. What is captured? It doesn't say.

Perhaps something better would be "The_Andromeda_Galaxy_0001.png". Great! Now we can't confuse it with "The Great Orion Nebula". More importantly we don't risk the chance of accidentally overwriting one file with another.

We can go further. With CMOS cameras we can choose from a range of gains and offsets. Perhaps we are experimenting with high gain vs low gain for the same object. A better file name would be "The_Andromeda_Galaxy_G100_BL20_0001.png".

I cannot speak for all image capture software since I use [SharpCap](https://www.sharpcap.co.uk/) exclusively. SharpCap gives me the ability to define text that will be added to each image file name. Hopefully your software gives you the same capability.

## My needs
I've identified eight things that are important to me:

1. Frame (e.g. Light, Flat, Dark, Bias)
1. Target (e.g. The Andromeda Galaxy, M31, The Great Orion Nebula, M42, etc.)
1. Filter (e.g. L, R, G, B, S, Ha, O)
1. Exposure (in seconds)
1. Gain
1. Offset
1. Date
1. Series (e.g. 01, 02, or A, B, etc.)

## Your needs
If your initial reaction is "that's good but what about...?" -- no worries. There is a file called *definition.json* that you can edit to meet your exact needs.

## Examples
* IC-1848_Light_Ha_200s_G389_BL30_20180929_01_00005.fits
* IC-1848_Flat_Ha_G389_BL30_20180929_01_00009.fits
* NGC-7380_Light_Ha_200s_G389_BL30_20180929_01_00021.fits
* Dark_200s_G389_BL30_20180928_00117.fits
* Bias_G389_BL30_20180928_00081.fits

## Constraints
Notice in the examples above that *Bias* frames have the fewest number of descriptive elements whereas *Light* frames have the most. This is due to *constraints* in the *definition.json* file.

JSON files are not difficult to understand. They are fairly intuitive.

I crafted my *definition.json* file so as to skip asking for *exposure* for *Bias* frames. That is because it is assumed that *Bias* frames use the fastest shutter speed available on the camera.

## Last Answers
After your first use the application will create a file called *answers.json* which will remember your last answers. This a real time-saver since you will find that in the course of an imaging session that the target doesn't change but the frame type does. The last answer is displayed in square-brackets. All you need to do is press *Enter* to keep it (but if you wish to delete it then type "-" which is a dash or hyphen or subtract-sign, if you will.)

Notice that if you leave an empty answer then that component will be left out of the result. For example, my definition file is set up to always ask for date but if I leave it empty then it will be omitted from the result.

## Data Validation
Please be mindful that your answer to *Frame* constrains other questions. The program sees *dark* and *Dark* as the same (i.e. case-insensitive) but *darks* is not the same. The ramification to making such a mistake is that *target* will be asked for when it should not. I will address this in a future version.

## The NodeJS application
The application in this GitHub repository is invoked from the command line. It is written in JavaScript and thus needs NodeJS to run. (You cannot run it from the browser!)

To install NodeJS:
* Navigate to https://nodejs.org
* Download and install the current version.

To download the application code:
* Click on the "*Clone or Download*" button in GitHub.
* Select *Download ZIP*.
* Extract the ZIP. Choose any location you wish.
* Launch the Command Prompt (for Windows users) and change the directory to that location.
* Type "*node app.js*".

## Contact
If you wish to modify *definition.json* and need some assistance please contact me through my GitHub.
