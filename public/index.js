//var selectPlaylist = document.getElementById('selectPlaylist');
var selectPlaylistSize = document.querySelectorAll('input[name="songList"]');
var submitPlaylistBtn = document.getElementById('playlistSubmitButton');

submitPlaylistBtn.addEventListener('click', function() {
    //console.log(selectPlaylist.value);

    for(var i = 0; i < selectPlaylistSize.length; i++) {
        if(selectPlaylistSize[i].checked) {
            console.log(selectPlaylistSize[i].value);
            window.location = '/views/display.ejs'
        }
    }
})
var selectPlaylistSizeT = document.querySelectorAll('input[name="songListT"]');
var submitPlaylistBtnT = document.getElementById('playlistSubmitButtonT');

submitPlaylistBtnT.addEventListener('click', function() {
    //console.log(selectPlaylist.value);

    for(var i = 0; i < selectPlaylistSizeT.length; i++) {
        if(selectPlaylistSizeT[i].checked) {
            console.log(selectPlaylistSizeT[i].value);
            window.location = '/views/display.ejs'
        }
    }
})
var selectPlaylistSizeL = document.querySelectorAll('input[name="songListL"]');
var submitPlaylistBtnL = document.getElementById('playlistSubmitButtonL');

submitPlaylistBtnL.addEventListener('click', function() {
    //console.log(selectPlaylist.value);

    for(var i = 0; i < selectPlaylistSizeL.length; i++) {
        if(selectPlaylistSizeL[i].checked) {
            console.log(selectPlaylistSizeL[i].value);
            window.location = '/views/display.ejs'
        }
    }
})