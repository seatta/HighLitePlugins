import { Plugin } from "@highlite/plugin-api";


import blah from "../resources/html/html.html";
import styles from "../resources/css/base.css";
import img from "../resources/images/image.png";
import snd from "../resources/sounds/Middlefern.mp3";

export default class ExamplePlugin extends Plugin {
    pluginName = "ExamplePlugin";
    author: string = "Your Name";

    constructor() {
        super()
    };

    init(): void {
    }

    start(): void {
        this.log("ExamplePlugin started");
        document.getElementById("app")!.innerHTML = blah;
        
        // Inject CSS styles
        const styleElement = document.createElement('style');
        styleElement.textContent = styles;
        document.head.appendChild(styleElement);
    }

    stop(): void {
        this.log("ExamplePlugin stopped");
    }
}