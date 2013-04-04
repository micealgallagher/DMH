function ShowFullSizeImage(fullImagePath, mainImageId)
{
    var imgFullImage = $("#" + mainImageId);
    imgFullImage.attr("src", fullImagePath);
}