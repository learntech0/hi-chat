
$(function() {
  $(".local-video-wrapper").draggable();
});

function checkVideoLayout() {

  const video_grid = document.getElementById("video-grid");
  const videos = video_grid.querySelectorAll("video");
  const video_count = videos.length;

  if (video_count == 1) {
    videos[0].style.width = "100%";
    videos[0].style.height = "100vh";
    videos[0].style.objectFit = "contain";
  } else if (video_count == 2) {
    videos[0].style.width = "100%";
    videos[0].style.height = "50vh";
    videos[0].style.objectFit = "contain";
    videos[1].style.width = "100%";
    videos[1].style.height = "50vh";
    videos[1].style.objectFit = "contain";
  } else if (video_count == 3) {
    videos[0].style.width = "100%";
    videos[0].style.height = "50vh";
    videos[0].style.objectFit = "contain";
    videos[1].style.width = "50%";
    videos[1].style.height = "50vh";
    videos[1].style.objectFit = "contain";
    videos[2].style.width = "50%";
    videos[2].style.height = "50vh";
    videos[2].style.objectFit = "contain";
  } else {
    videos[0].style.width = "50%";
    videos[0].style.height = "50vh";
    videos[0].style.objectFit = "contain";
    videos[1].style.width = "50%";
    videos[1].style.height = "50vh";
    videos[1].style.objectFit = "contain";
    videos[2].style.width = "50%";
    videos[2].style.height = "50vh";
    videos[2].style.objectFit = "contain";
    videos[3].style.width = "50%";
    videos[3].style.height = "50vh";
    videos[3].style.objectFit = "contain";
  }
}