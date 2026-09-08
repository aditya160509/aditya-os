import windowResize from './windowResize.png';
import maximize from './maximize.png';
import minimize from './minimize.png';
import computerBig from './computerBig.png';
import computerSmall from './computerSmall.png';
import myComputer from './myComputer.png';
import showcaseIcon from './showcaseIcon.png';
import doomIcon from './doomIcon.png';
import henordleIcon from './henordleIcon.png';
import credits from './credits.png';
import volumeOn from './volumeOn.png';
import volumeOff from './volumeOff.png';
import trailIcon from './trailIcon.png';
import windowGameIcon from './windowGameIcon.png';
import windowExplorerIcon from './windowExplorerIcon.png';
import windowsStartIcon from './windowsStartIcon.png';
import scrabbleIcon from './scrabbleIcon.png';
import close from './close.png';
import openai from './brands/openai.svg';
import claude from './brands/claude.svg';
import chrome from './brands/chrome.svg';
import safari from './brands/safari.svg';
import spotify from './brands/spotify.svg';
import github from './brands/github.svg';
import python from './brands/python.svg';
import nodejs from './brands/nodejs.svg';
import cloud from './brands/cloud.svg';
import apple from './brands/apple.svg';
import google from './brands/google.svg';
import figma from './brands/figma.svg';
import microsoft from './brands/microsoft.svg';
import meta from './brands/meta.svg';
import amazon from './brands/amazon.svg';
import slack from './brands/slack.svg';
import swift from './brands/swift.svg';
import trading from './trading.svg';
import snake from './snake.svg';
import game2048 from './game2048.svg';
import pong from './pong.svg';
import tetris from './tetris.svg';
import chess from './chess.svg';
import solitaire from './solitaire.svg';
import vscode from './vscode.svg';
import terminal from './terminal.svg';
import settings from './settings.svg';
import portfolio from './portfolio.svg';

const icons = {
    windowResize: windowResize,
    maximize: maximize,
    minimize: minimize,
    computerBig: computerBig,
    computerSmall: computerSmall,
    myComputer: myComputer,
    showcaseIcon: showcaseIcon,
    doomIcon: doomIcon,
    volumeOn: volumeOn,
    volumeOff: volumeOff,
    credits: credits,
    scrabbleIcon: scrabbleIcon,
    henordleIcon: henordleIcon,
    close: close,
    windowGameIcon: windowGameIcon,
    windowExplorerIcon: windowExplorerIcon,
    windowsStartIcon: windowsStartIcon,
    trailIcon: trailIcon,
    openai,
    claude,
    chrome,
    safari,
    spotify,
    github,
    python,
    nodejs,
    cloud,
    apple,
    google,
    figma,
    microsoft,
    meta,
    amazon,
    slack,
    swift,
    trading,
    snake,
    game2048,
    pong,
    tetris,
    chess,
    solitaire,
    vscode,
    terminal,
    settings,
    portfolio,
};

export type IconName = keyof typeof icons;

const getIconByName = (iconName: IconName): string => icons[iconName];

export default getIconByName;
