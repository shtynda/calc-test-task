const radios = document.querySelectorAll('input[type=radio][name="storage"]');
const sliders = document.getElementsByClassName("slider");

[].forEach.call(sliders, (slider) => {
    slider.oninput = () => {
        controller.changeGb();
        controller.bestCompany();
    };
});

radios.forEach((radio) =>
    radio.addEventListener("change", () => {
        if (radio.id === "hdd") bunny.selectedStorage("hdd");

        if (radio.id === "ssd") bunny.selectedStorage("ssd");

        if (radio.id === "single") scaleway.selectedStorage("single");

        if (radio.id === "multi") scaleway.selectedStorage("multi");

        controller.changeGb();
        controller.bestCompany();
    })
);

const size = {
    storageGb: 0,
    transferGb: 0,
};

class Calc {
    constructor() {
        this.maxStat = 82;
    }
    get activePrice() {
        return (
            size.storageGb * this.priceStorage +
            size.transferGb * this.priceTransfer
        ).toFixed(2);
    }
}

class Company extends Calc {
    constructor(options) {
        super();
        this.name = options.name;
        this.priceStorage = options.priceStorage;
        this.priceTransfer = options.priceTransfer;
        this.minPrice = options.minPrice;
        this.maxPrice = options.maxPrice;
    }
    showPrice() {
        if (this.minPrice > super.activePrice) {
            document.getElementById(this.name).innerHTML = this.minPrice;
            return;
        }
        if (this.maxPrice <= super.activePrice) {
            document.getElementById(this.name).innerHTML = this.maxPrice;
            return;
        }
        document.getElementById(this.name).innerHTML = super.activePrice;
    }
    showStat() {
        if (document.documentElement.clientWidth <= 768) {
            document.getElementById("stat-" + this.name).style.width =
                "inherit";
            if (this.maxPrice <= super.activePrice) {
                document.getElementById("stat-" + this.name).style.height =
                    (this.maxPrice / this.maxStat) * 100 + "%";
                return;
            }
            if (this.minPrice >= super.activePrice) {
                document.getElementById("stat-" + this.name).style.height =
                    (this.minPrice / this.maxStat) * 100 + "%";
                return;
            }
            document.getElementById("stat-" + this.name).style.height =
                (super.activePrice / this.maxStat) * 100 + "%";
        }
        if (document.documentElement.clientWidth > 768) {
            document.getElementById("stat-" + this.name).style.height =
                "inherit";

            if (this.maxPrice <= super.activePrice) {
                document.getElementById("stat-" + this.name).style.width =
                    (this.maxPrice / this.maxStat) * 100 + "%";
                return;
            }
            if (this.minPrice >= super.activePrice) {
                document.getElementById("stat-" + this.name).style.width =
                    (this.minPrice / this.maxStat) * 100 + "%";
                return;
            }
            document.getElementById("stat-" + this.name).style.width =
                (super.activePrice / this.maxStat) * 100 + "%";
        }
    }
}

const backblaze = new Company({
    name: "backblaze",
    priceStorage: 0.005,
    priceTransfer: 0.01,
    minPrice: 7,
});

const bunny = new Company({
    name: "bunny",
    maxPrice: 10,
    priceStorage: 0.01,
    priceTransfer: 0.01,
});
bunny.selectedStorage = function (storage) {
    if (storage === "hdd") {
        this.priceStorage = 0.01;
    }
    if (storage === "ssd") {
        this.priceStorage = 0.02;
    }
};

const scaleway = new Company({
    name: "scaleway",
    priceStorage: 0.03,
    priceTransfer: 0.02,
});
scaleway.freeStorageGb = 75;
scaleway.freeTransferGb = 75;
scaleway.selectedStorage = function (storage) {
    if (storage === "single") {
        this.priceStorage = 0.03;
    }
    if (storage === "multi") {
        this.priceStorage = 0.06;
    }
};
scaleway.showPrice = function () {
    let freePrice =
        this.freeStorageGb * this.priceStorage +
        this.freeTransferGb * this.priceTransfer;

    if (
        this.freeStorageGb > size.storageGb &&
        this.freeTransferGb > size.transferGb
    ) {
        document.getElementById(this.name).innerHTML = 0;
    }

    if (
        freePrice < this.activePrice &&
        (this.freeStorageGb < size.storageGb ||
            this.freeTransferGb < size.transferGb)
    ) {
        document.getElementById(this.name).innerHTML = (
            this.activePrice - freePrice
        ).toFixed(2);
    }
};

const vultr = new Company({
    name: "vultr",
    minPrice: 5,
    priceStorage: 0.01,
    priceTransfer: 0.01,
});

const controller = {
    sliderStorage: document.getElementById("storage"),
    sliderTransfer: document.getElementById("transfer"),

    storageValue: document.getElementById("storage-value"),
    transferValue: document.getElementById("transfer-value"),

    bestCompany: function () {
        const color = ["red", "orange", "purple", "blue"];
        const company = document.getElementsByClassName("stata-val");
        let bestIndex = 0;
        for (let i = 0; i < company.length; i++) {
            let w1;
            let w2;
            if (document.documentElement.clientWidth < 768) {
                w1 = company[bestIndex].style.height;
                w2 = company[i].style.height;
            } else {
                w1 = company[bestIndex].style.width;
                w2 = company[i].style.width;
            }

            company[i].style.backgroundColor = "grey";

            if (
                Number(w1.substring(0, w1.length - 1)) >
                Number(w2.substring(0, w2.length - 1))
            ) {
                bestIndex = i;
            }
        }
        company[bestIndex].style.backgroundColor = color[bestIndex];
    },

    changeGb: function () {
        this.storageValue.innerHTML = this.sliderStorage.value;
        size.storageGb = this.sliderStorage.value;

        this.transferValue.innerHTML = this.sliderTransfer.value;
        size.transferGb = this.sliderTransfer.value;

        backblaze.showPrice();
        bunny.showPrice();
        scaleway.showPrice();
        vultr.showPrice();

        backblaze.showStat();
        bunny.showStat();
        scaleway.showStat();
        vultr.showStat();
    },
};
