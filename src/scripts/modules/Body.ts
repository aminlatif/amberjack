/*
 * @author    Amin Latifkar <amin.latifkar@gmail.com>
 * @link      https://www.babirusa.net
 */

import $ from 'jquery';

class Body {
    toggleScroll = () => {
        if (this) {
            if (this.isScrollEnabled()) {
                this.enableScroll();
            } else {
                this.disableScroll();
            }
        }
    }

    disableScroll = () => {
        document.body.classList.add('no-scroll');
    }

    enableScroll = () => {
        document.body.classList.remove('no-scroll');
    }

    isScrollEnabled = (): boolean => {
        return !document.body.classList.contains('no-scroll');
    }

    scrollToBreadcrumb = () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: $(".breadcrumbs").offset().top
        }, 1000, function () {
            // closeFiltersOnMobile();
        });
    }

    scrollToTop = () => {
        $([document.documentElement, document.body]).animate({
            scrollTop: 0
        }, 1000, function () {
        });
    }
}

export default new Body();