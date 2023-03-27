import jimp from "jimp";

// 1. Open Image A
// 2. Open Image B
// 3. Open Background
// 4. Expand background to a + b
// 5. Composite A into the center of the background
// 6. Composite B into a specified position of the background.
// 7. Auto-crop to fit the image as it is.
// 8. ???
// 9. Profit
function layerImages(a: string, b: string, bg: string, bPos: number[]) {
  jimp.read(a)
    .then((imgA) => {
      jimp.read(b)
        .then((imgB) => {
          jimp.read(bg)
            .then((imgBg) => {
              const height = (imgA.getHeight() + imgB.getHeight()) * 2;
              const width = (imgA.getWidth() + imgB.getWidth()) * 2;
              imgBg.resize(width, height, jimp.RESIZE_NEAREST_NEIGHBOR);
              imgBg.composite(imgA, width / 1.5, height / 1.5);
              imgBg.composite(imgB, (width / 1.5) + (imgA.getWidth() / 1.5), height / 2);
              // imgBg.autocrop()
              console.log("Saving image ...");
              return imgBg.write("img\\test.png");
            })
            .catch((imgBgFailReason) => {
              console.log("can't open bg");
              console.log(imgBgFailReason);
            });
        })
        .catch((imgBFailReason) => {
          console.log("can't open b");
          console.log(imgBFailReason);
        });
    })
    .catch((imgAFailReason) => {
      console.log("can't open a");
      console.log(imgAFailReason);
    });
}

const a = "img\\a.png";
const b = "img\\b.png";
const bg = "img\\bg.png";

layerImages(a, b, bg, [.5, .5]);
