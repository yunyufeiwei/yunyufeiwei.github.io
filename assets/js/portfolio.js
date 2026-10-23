const menuToggle = document.getElementById("menu-toggle");
const navLinks = document.getElementById("nav-links");
const siteHeader = document.querySelector(".site-header");

if (siteHeader) {
    const updateHeader = () => {
        siteHeader.classList.toggle("is-scrolled", window.scrollY > 12);
    };

    updateHeader();
    window.addEventListener("scroll", updateHeader, { passive: true });
}

if (menuToggle && navLinks) {
    menuToggle.addEventListener("click", () => {
        const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
        menuToggle.setAttribute("aria-expanded", String(!isOpen));
        menuToggle.setAttribute("aria-label", isOpen ? "打开导航" : "关闭导航");
        navLinks.classList.toggle("is-open", !isOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            menuToggle.setAttribute("aria-expanded", "false");
            menuToggle.setAttribute("aria-label", "打开导航");
            navLinks.classList.remove("is-open");
        });
    });
}

const currentYear = document.getElementById("current-year");
if (currentYear) {
    currentYear.textContent = String(new Date().getFullYear());
}

const showcase = document.querySelector(".showcase");
if (showcase) {
    const workSection = showcase.closest(".work");
    const track = showcase.querySelector(".showcase-track");
    const slides = [...showcase.querySelectorAll(".showcase-slide")];
    const dots = [...document.querySelectorAll(".showcase-dot")];
    const currentIndex = document.getElementById("showcase-current");
    const previousButton = document.querySelector(".showcase-prev");
    const nextButton = document.querySelector(".showcase-next");
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let activeIndex = 0;
    let timer;
    let isHovered = false;
    let hasFocus = false;

    const stopTimer = () => {
        window.clearTimeout(timer);
    };

    const scheduleNext = () => {
        stopTimer();
        if (!reduceMotion.matches && !isHovered && !hasFocus && !document.hidden) {
            timer = window.setTimeout(() => {
                showSlide(activeIndex + 1);
            }, 6500);
        }
    };

    const showSlide = (index) => {
        activeIndex = (index + slides.length) % slides.length;
        track.style.transform = `translate3d(-${activeIndex * 100}%, 0, 0)`;

        slides.forEach((slide, slideIndex) => {
            const isActive = slideIndex === activeIndex;
            slide.classList.toggle("is-active", isActive);
            slide.setAttribute("aria-hidden", String(!isActive));
            slide.querySelectorAll("a").forEach((link) => {
                link.tabIndex = isActive ? 0 : -1;
            });
        });

        dots.forEach((dot, dotIndex) => {
            const isActive = dotIndex === activeIndex;
            dot.classList.toggle("is-active", isActive);
            dot.setAttribute("aria-current", String(isActive));
        });
        if (currentIndex) {
            currentIndex.textContent = String(activeIndex + 1).padStart(2, "0");
        }
        scheduleNext();
    };

    dots.forEach((dot, index) => {
        dot.addEventListener("click", () => showSlide(index));
    });
    previousButton?.addEventListener("click", () => showSlide(activeIndex - 1));
    nextButton?.addEventListener("click", () => showSlide(activeIndex + 1));

    showcase.addEventListener("pointerenter", () => {
        isHovered = true;
        stopTimer();
    });
    showcase.addEventListener("pointerleave", () => {
        isHovered = false;
        scheduleNext();
    });
    workSection?.addEventListener("focusin", () => {
        hasFocus = true;
        stopTimer();
    });
    workSection?.addEventListener("focusout", (event) => {
        if (!workSection.contains(event.relatedTarget)) {
            hasFocus = false;
            scheduleNext();
        }
    });
    workSection?.addEventListener("keydown", (event) => {
        if (event.key === "ArrowLeft") {
            showSlide(activeIndex - 1);
        } else if (event.key === "ArrowRight") {
            showSlide(activeIndex + 1);
        }
    });
    document.addEventListener("visibilitychange", scheduleNext);
    reduceMotion.addEventListener("change", scheduleNext);
    scheduleNext();
}

const shaderCode = document.getElementById("shader-code");
if (shaderCode) {
    const shaderFallback = String.raw`struct Attributes
{
    float4 positionOS   : POSITION;
    float2 texcoord     : TEXCOORD;
};
struct Varyings
{
    float4 positionHCS  : SV_POSITION;
    float2 uv           : TEXCOORD;
};

TEXTURE2D(_BaseMap);SAMPLER(sampler_BaseMap);

CBUFFER_START(UnityPerMaterial)
    float4 _BaseMap_ST;
    float4  _Color;
CBUFFER_END

Varyings vert(Attributes v)
{
    Varyings o = (Varyings)0;

    o.positionHCS = TransformObjectToHClip(v.positionOS.xyz);
    o.uv = TRANSFORM_TEX(v.texcoord , _BaseMap);

    return o;
}

half4 frag(Varyings i):SV_TARGET
{
    half4 FinalColor;
    half4 baseMap = SAMPLE_TEXTURE2D(_BaseMap,sampler_BaseMap , i.uv);
    FinalColor = baseMap * _Color;
    return FinalColor;
}`;
    const renderShader = (source) => {
            const fragment = document.createDocumentFragment();
            const tokenPattern = /\/\/.*$|\b(?:struct|float4|float2|float|half4|return)\b|\b(?:POSITION|TEXCOORD|SV_POSITION|SV_TARGET)\b|\b(?:TEXTURE2D|SAMPLER|CBUFFER_START|CBUFFER_END|TRANSFORM_TEX|SAMPLE_TEXTURE2D)\b/g;
            const tokenClasses = new Map([
                ["struct", "code-keyword"],
                ["float4", "code-type"],
                ["float2", "code-type"],
                ["float", "code-type"],
                ["half4", "code-type"],
                ["return", "code-keyword"],
                ["POSITION", "code-semantic"],
                ["TEXCOORD", "code-semantic"],
                ["SV_POSITION", "code-semantic"],
                ["SV_TARGET", "code-semantic"],
                ["TEXTURE2D", "code-macro"],
                ["SAMPLER", "code-macro"],
                ["CBUFFER_START", "code-macro"],
                ["CBUFFER_END", "code-macro"],
                ["TRANSFORM_TEX", "code-macro"],
                ["SAMPLE_TEXTURE2D", "code-macro"]
            ]);
            const lines = source.replace(/\r\n?/g, "\n").replace(/\n$/, "").split("\n");

            lines.forEach((line, index) => {
                const lineElement = document.createElement("span");
                lineElement.className = line.trim() ? "code-line" : "code-line code-gap";

                const number = document.createElement("b");
                number.textContent = String(index + 1).padStart(2, "0");
                lineElement.append(number);

                const code = document.createElement("code");
                let lastIndex = 0;
                for (const match of line.matchAll(tokenPattern)) {
                    code.append(document.createTextNode(line.slice(lastIndex, match.index)));

                    const token = document.createElement("span");
                    token.className = match[0].startsWith("//")
                        ? "code-comment"
                        : tokenClasses.get(match[0]) || "";
                    token.textContent = match[0];
                    code.append(token);
                    lastIndex = match.index + match[0].length;
                }
                code.append(document.createTextNode(line.slice(lastIndex)));
                lineElement.append(code);
                fragment.append(lineElement);
            });

            shaderCode.replaceChildren(fragment);
    };

    if (window.location.protocol === "file:") {
        renderShader(shaderFallback);
    } else {
        fetch(new URL("assets/code/SimpleTexture.hlsl", document.baseURI))
            .then((response) => {
                if (!response.ok) {
                    throw new Error(`Shader source request failed with status ${response.status}.`);
                }
                return response.text();
            })
            .then(renderShader)
            .catch((error) => {
                console.warn("Unable to load the external shader source; showing the local preview.", error);
                renderShader(shaderFallback);
            });
    }
}
