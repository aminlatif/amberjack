/*
 * @author    Amin Latifkar <amin.latifkar@gmail.com>
 * @link      https://www.babirusa.net
 */

import Body from './Body';

const loadingExitDuration = 500;

class PageLoading {
    private documentImages?: HTMLImageElement[];
    private pageLoadingWrapper?: HTMLElement;
    private pageLoadingPercent?: HTMLElement;
    private totalImagesCount = 0;
    private loadedImagesCount = 0;
    private totalItemsCount = 0;

    constructor() {
        document.addEventListener('DOMContentLoaded', this.initLoading, false);
        window.addEventListener('load', this.loadingFinished);
    }

    initLoading = (): void => {
        this.initPageElements();

        this.totalImagesCount = this.documentImages.length;

        if (this.totalImagesCount === 0) {
            this.loadingFinished();
        } else {
            this.totalItemsCount = this.totalImagesCount + 1;
            Body.disableScroll();
            for (let i = 0; i < this.totalImagesCount; i++) {
                const imageObject = new Image();
                imageObject.onload = this.imageLoaded;
                imageObject.onerror = this.imageLoaded;
                imageObject.src = this.documentImages[i].src;
            }
        }
    }

    initPageElements = (): void => {
        this.documentImages = Array.from(document.images);
        this.pageLoadingWrapper = document.getElementById('page-loading-wrapper');
        this.pageLoadingPercent = document.getElementById('page-loading-percent');
    }

    displayFormattedPercent = (): void => {
        this.pageLoadingPercent.innerHTML = this.getFormattedPercent();
    }

    getFormattedPercent = (): string => {
        return this.calculatePercent().toString() + '%';
    }

    calculatePercent = (): number => {
        let percent = Math.round((this.loadedImagesCount / this.totalItemsCount) * 100);
        if (percent > 100) {
            percent = 100;
        }
        return percent;
    }

    imageLoaded = (): void => {
        this.loadedImagesCount++;
        this.displayFormattedPercent();
    }

    loadingFinished = (): void => {
        this.loadedImagesCount++;
        this.displayFormattedPercent();
        this.pageLoadingWrapper.style.transition = 'opacity ' + loadingExitDuration + 'ms';
        this.pageLoadingWrapper.style.opacity = '0';
        setTimeout(() => {
                this.pageLoadingWrapper.remove();
                Body.enableScroll();
            },
            loadingExitDuration);
    }
}

new PageLoading();