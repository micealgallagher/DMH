var fileName = "xml/DMHAutomotiveWebsiteContent.xml";
var latestStock = "aLatestStock";
var carStockItem = "liCarStockItem";
var LatestStockMaxNum = 4;
var StockMaxDisplay = 4;
var langPrefix;
var CurrentIndex = 0;
var Offset = 0;
var OffsetAdjustment = 4;
var xmlFile
var TotalNumCars = -1;

function AttemptToOpenContentFile(page)
{
    // Store a pointer to the function that will make use of
    // the file once it has been successfully parsed
    var functionPointer;

    // Set the function pointer based on the page name
    switch (page)
    {
        case "HOME":
            functionPointer = function (xml) { PopulateLatestStockContent(xml) };
            break;
        case "CARSFORSALE":
            functionPointer = function (xml) { PopulateCarStockContent(xml) };
            break;
    }

    // Attempt to open the file
    $(document).ready(function ()
    {
        $.ajax({
            type: "GET",
            url: fileName,
            dataType: "xml",
            success: functionPointer,
            error: Problem
        });
    });
}

function Problem(XMLHttpRequest, textStatus, errorThrown) {
    alert(XMLHttpRequest + " | " + textStatus + " | " + errorThrown);
}

function SetOffset(indexOffset)
{
    // Clear the listing of cars currently displayed
    ClearListing();

    // Adjust the offset to display the next group of cars
    // and read the file again
    Offset += indexOffset;
    AttemptToOpenContentFile('CARSFORSALE');
}

function ClearListing()
{
    // Get each list item that displays a car and remove it's content
    $("li[id^='liCarStockItem']").each(function ()
    {
        $(this).html("");
    });
}

function PopulateCarStockContent(xml)
{
    var cars = $(xml).find("car");
    TotalNumCars = cars.length;

    cars.each(function (stockItemIndex)
    {
        if (stockItemIndex >= Offset && stockItemIndex < (Offset + OffsetAdjustment))
        {
            // prepare the popup id
            var popupId = "popup" + stockItemIndex;

            // Get the latest stock item
            var stockItem = $("#" + carStockItem + (stockItemIndex - Offset));

            // Store the image node of the XML
            var images = $(this).find("images");

            // From the XML file get the details of each car
            var dateAdded = $.trim($(this).attr("dateAdded"));
            var thumb = $.trim(images.find("image").first().attr("thumb"));

            // We only want to show an submation of the car's description
            var description = $(this).find("description").text().trim();

            // Add the img and strong tags to the latest stock item
            var img = $("<img/>").attr("src", thumb);
            img.attr("style", "width: 160px");
            var title = $("<strong></strong>").text(dateAdded);

            // Set the onlick allow a user to view a popup with additional images
            img.attr("OnClick", "ShowMorePictures('" + popupId + "')");
            img.attr("style", "cursor: pointer");

            // Add the individual details of the car to the latest stock item
            stockItem.append(img);
            stockItem.append(title);
            stockItem.append(description);

            stockItem.append(CreatePopupDiv(images, popupId))

            ShowHidePrevNext(stockItemIndex);
        }
    });
}

function CreatePopupDiv(images, popupId)
{
    // Create a div to hold the popup
    var divPopupHolder = $("<div></div>");
    divPopupHolder.attr("class", "divPopupHolder");
    divPopupHolder.attr("style", "display:none;")
    divPopupHolder.attr("id", popupId);

    // Create a div to hold the full size image
    var divFullImage = $("<div></div>");
    divFullImage.attr("class", "divFullImage");

    // Use a randomly generated number as the id
    // of the img tag that holds the full size image
    var fullSizeImgId = popupId + "FullImage";

    // Create a image tag to display the full size image
    var imgFullImage = $("<img/>");
    imgFullImage.attr("id", fullSizeImgId);
    // Set the image page for the full size image
    imgFullImage.attr("src", images.find("image").first().attr("full"));

    // Create a div to hold the thumbnail images
    var divThumbNailHolder = $("<div></div>");
    divThumbNailHolder.attr("class", "divThumbnailHolder");

    // Create a button to allow a user to close the popup
    var btnClose = $('<input />');
    btnClose.attr("type", "button");
    btnClose.attr("value", "Close");
    btnClose.attr("OnClick", "javascript: $.unblockUI();");

    images.find("image").each(function ()
    {

        // Create the div to hold the thumbnail image
        // and the img to show the image
        var divThumbnail = $("<div></div>");
        var imgThumbnail = $("<img />");

        // Get the path for both the thumbnail and full size image
        var thumbPath = $(this).attr("thumb");
        var fullPath = $(this).attr("full");

        // set the path of the thumbnail
        imgThumbnail.attr("src", thumbPath);

        // Set the onclick function to allow the displaying of the full size image
        var onclick = "ShowFullSizeImage('" + fullPath + "','" + fullSizeImgId + "')"
        imgThumbnail.attr("OnClick", onclick);

        // add the thumbnail to it's div
        divThumbnail.append(imgThumbnail);

        // add the thumbnail div to the holding div
        divThumbNailHolder.append(divThumbnail);
    });

    // Append all the nodes together
    // POPUP HOLDER > FULL IMAGE (> full size image) > THUMB HOLDER
    divPopupHolder.append(divFullImage);
    divFullImage.append(imgFullImage);
    divPopupHolder.append(divThumbNailHolder);
    divPopupHolder.append(btnClose);

    return divPopupHolder;
}

function ShowMorePictures(popupId)
{
    $.blockUI({ message: $('#' + popupId), css: { backgroundColor: 'black', width: 'auto', height: 'auto'} });
}

function ShowHidePrevNext(stockItemIndex)
{
    // Get the previous and next buttons
    var btnPrev = $("#btnPrev");
    var btnNext = $("#btnNext");

    // If the last car is being displayed then hide the next button
    if (stockItemIndex == TotalNumCars - 1)
    {
        btnNext.hide();
    }
    else
    {
        btnNext.show();
    }

    // If the first car is being displayed then hide the previous button
    if (Offset == 0)
    {
        btnPrev.hide();
    }
    else
    {
        btnPrev.show();
    }
}

function PopulateLatestStockContent(xml)
{
    $(xml).find("car").each(function ()
    {
        // Get the latest stock item
        var stockHyperLink = $("#" + latestStock + LatestStockMaxNum);

        // From the XML file get the details of each car
        var dateAdded = $.trim($(this).attr("dateAdded"));
        var thumb = $.trim($(this).find("images").find("image").first().attr("thumb"));
        // We only want to show an submation of the car's description
        var description = $(this).find("description").text().trim().substring(0, 50);

        // Add the img and strong tags to the latest stock item
        var img = $("<img/>").attr("src", thumb);
        img.attr("style", "width: 90px");
        var title = $("<strong></strong>").text(dateAdded);

        // Add the individual details of the car to the latest stock item
        stockHyperLink.append(img);
        stockHyperLink.append(title);
        stockHyperLink.append(description);

        // We may want to display additional latest stock items
        // this variable will simply need modified.
        if (LatestStockMaxNum == 0)
        {
            return;
        }
        else
        {
            LatestStockMaxNum--;
        }
    });
}

