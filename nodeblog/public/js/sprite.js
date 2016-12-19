var SVG = `
<svg style="position: absolute; width: 0; height: 0; overflow: hidden;" version="1.1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink">
<defs>
<symbol id="icon-align-left" viewBox="0 0 28 28">
<title>align-left</title>
<path class="path1" d="M28 21v2c0 0.547-0.453 1-1 1h-26c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h26c0.547 0 1 0.453 1 1zM22 15v2c0 0.547-0.453 1-1 1h-20c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h20c0.547 0 1 0.453 1 1zM26 9v2c0 0.547-0.453 1-1 1h-24c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h24c0.547 0 1 0.453 1 1zM20 3v2c0 0.547-0.453 1-1 1h-18c-0.547 0-1-0.453-1-1v-2c0-0.547 0.453-1 1-1h18c0.547 0 1 0.453 1 1z"></path>
</symbol>
<symbol id="icon-github" viewBox="0 0 24 28">
<title>github</title>
<path class="path1" d="M12 2c6.625 0 12 5.375 12 12 0 5.297-3.437 9.797-8.203 11.391-0.609 0.109-0.828-0.266-0.828-0.578 0-0.391 0.016-1.687 0.016-3.297 0-1.125-0.375-1.844-0.812-2.219 2.672-0.297 5.484-1.313 5.484-5.922 0-1.313-0.469-2.375-1.234-3.219 0.125-0.313 0.531-1.531-0.125-3.187-1-0.313-3.297 1.234-3.297 1.234-0.953-0.266-1.984-0.406-3-0.406s-2.047 0.141-3 0.406c0 0-2.297-1.547-3.297-1.234-0.656 1.656-0.25 2.875-0.125 3.187-0.766 0.844-1.234 1.906-1.234 3.219 0 4.594 2.797 5.625 5.469 5.922-0.344 0.313-0.656 0.844-0.766 1.609-0.688 0.313-2.438 0.844-3.484-1-0.656-1.141-1.844-1.234-1.844-1.234-1.172-0.016-0.078 0.734-0.078 0.734 0.781 0.359 1.328 1.75 1.328 1.75 0.703 2.141 4.047 1.422 4.047 1.422 0 1 0.016 1.937 0.016 2.234 0 0.313-0.219 0.688-0.828 0.578-4.766-1.594-8.203-6.094-8.203-11.391 0-6.625 5.375-12 12-12zM4.547 19.234c0.031-0.063-0.016-0.141-0.109-0.187-0.094-0.031-0.172-0.016-0.203 0.031-0.031 0.063 0.016 0.141 0.109 0.187 0.078 0.047 0.172 0.031 0.203-0.031zM5.031 19.766c0.063-0.047 0.047-0.156-0.031-0.25-0.078-0.078-0.187-0.109-0.25-0.047-0.063 0.047-0.047 0.156 0.031 0.25 0.078 0.078 0.187 0.109 0.25 0.047zM5.5 20.469c0.078-0.063 0.078-0.187 0-0.297-0.063-0.109-0.187-0.156-0.266-0.094-0.078 0.047-0.078 0.172 0 0.281s0.203 0.156 0.266 0.109zM6.156 21.125c0.063-0.063 0.031-0.203-0.063-0.297-0.109-0.109-0.25-0.125-0.313-0.047-0.078 0.063-0.047 0.203 0.063 0.297 0.109 0.109 0.25 0.125 0.313 0.047zM7.047 21.516c0.031-0.094-0.063-0.203-0.203-0.25-0.125-0.031-0.266 0.016-0.297 0.109s0.063 0.203 0.203 0.234c0.125 0.047 0.266 0 0.297-0.094zM8.031 21.594c0-0.109-0.125-0.187-0.266-0.172-0.141 0-0.25 0.078-0.25 0.172 0 0.109 0.109 0.187 0.266 0.172 0.141 0 0.25-0.078 0.25-0.172zM8.937 21.438c-0.016-0.094-0.141-0.156-0.281-0.141-0.141 0.031-0.234 0.125-0.219 0.234 0.016 0.094 0.141 0.156 0.281 0.125s0.234-0.125 0.219-0.219z"></path>
</symbol>
<symbol id="icon-feed" viewBox="0 0 22 28">
<title>feed</title>
<path class="path1" d="M6 21c0 1.656-1.344 3-3 3s-3-1.344-3-3 1.344-3 3-3 3 1.344 3 3zM14 22.922c0.016 0.281-0.078 0.547-0.266 0.75-0.187 0.219-0.453 0.328-0.734 0.328h-2.109c-0.516 0-0.938-0.391-0.984-0.906-0.453-4.766-4.234-8.547-9-9-0.516-0.047-0.906-0.469-0.906-0.984v-2.109c0-0.281 0.109-0.547 0.328-0.734 0.172-0.172 0.422-0.266 0.672-0.266h0.078c3.328 0.266 6.469 1.719 8.828 4.094 2.375 2.359 3.828 5.5 4.094 8.828zM22 22.953c0.016 0.266-0.078 0.531-0.281 0.734-0.187 0.203-0.438 0.313-0.719 0.313h-2.234c-0.531 0-0.969-0.406-1-0.938-0.516-9.078-7.75-16.312-16.828-16.844-0.531-0.031-0.938-0.469-0.938-0.984v-2.234c0-0.281 0.109-0.531 0.313-0.719 0.187-0.187 0.438-0.281 0.688-0.281h0.047c5.469 0.281 10.609 2.578 14.484 6.469 3.891 3.875 6.188 9.016 6.469 14.484z"></path>
</symbol>
<symbol id="icon-smile-o" viewBox="0 0 24 28">
<title>smile-o</title>
<path class="path1" d="M17.719 16.797c-0.781 2.516-3.078 4.203-5.719 4.203s-4.937-1.687-5.719-4.203c-0.172-0.531 0.125-1.078 0.656-1.25 0.516-0.172 1.078 0.125 1.25 0.656 0.516 1.672 2.063 2.797 3.813 2.797s3.297-1.125 3.813-2.797c0.172-0.531 0.734-0.828 1.266-0.656 0.516 0.172 0.812 0.719 0.641 1.25zM10 10c0 1.109-0.891 2-2 2s-2-0.891-2-2 0.891-2 2-2 2 0.891 2 2zM18 10c0 1.109-0.891 2-2 2s-2-0.891-2-2 0.891-2 2-2 2 0.891 2 2zM22 14c0-5.516-4.484-10-10-10s-10 4.484-10 10 4.484 10 10 10 10-4.484 10-10zM24 14c0 6.625-5.375 12-12 12s-12-5.375-12-12 5.375-12 12-12 12 5.375 12 12z"></path>
</symbol>
<symbol id="icon-envelope-square" viewBox="0 0 24 28">
<title>envelope-square</title>
<path class="path1" d="M19.5 2c2.484 0 4.5 2.016 4.5 4.5v15c0 2.484-2.016 4.5-4.5 4.5h-15c-2.484 0-4.5-2.016-4.5-4.5v-15c0-2.484 2.016-4.5 4.5-4.5h15zM20 18.5v-6.813c-0.297 0.328-0.625 0.625-1 0.859-1.469 0.969-2.984 1.875-4.438 2.875-0.734 0.516-1.641 1.078-2.562 1.078v0 0 0 0c-0.922 0-1.828-0.562-2.562-1.078-1.453-1-2.984-1.891-4.438-2.891-0.359-0.234-0.641-0.578-1-0.844v6.813c0 0.828 0.672 1.5 1.5 1.5h13c0.828 0 1.5-0.672 1.5-1.5zM20 9.547c0-0.844-0.625-1.547-1.5-1.547h-13c-0.828 0-1.5 0.672-1.5 1.5 0 0.844 0.875 1.766 1.531 2.203 1.375 0.922 2.797 1.781 4.172 2.688 0.594 0.391 1.578 1.109 2.297 1.109s1.703-0.719 2.297-1.109c1.391-0.906 2.781-1.797 4.172-2.719 0.609-0.406 1.531-1.344 1.531-2.125z"></path>
</symbol>
<symbol id="icon-double-down" viewBox="0 0 18 28">
<title>double-down</title>
<path class="path1" d="M16.797 13.5c0 0.125-0.063 0.266-0.156 0.359l-7.281 7.281c-0.094 0.094-0.234 0.156-0.359 0.156s-0.266-0.063-0.359-0.156l-7.281-7.281c-0.094-0.094-0.156-0.234-0.156-0.359s0.063-0.266 0.156-0.359l0.781-0.781c0.094-0.094 0.219-0.156 0.359-0.156 0.125 0 0.266 0.063 0.359 0.156l6.141 6.141 6.141-6.141c0.094-0.094 0.234-0.156 0.359-0.156s0.266 0.063 0.359 0.156l0.781 0.781c0.094 0.094 0.156 0.234 0.156 0.359zM16.797 7.5c0 0.125-0.063 0.266-0.156 0.359l-7.281 7.281c-0.094 0.094-0.234 0.156-0.359 0.156s-0.266-0.063-0.359-0.156l-7.281-7.281c-0.094-0.094-0.156-0.234-0.156-0.359s0.063-0.266 0.156-0.359l0.781-0.781c0.094-0.094 0.219-0.156 0.359-0.156 0.125 0 0.266 0.063 0.359 0.156l6.141 6.141 6.141-6.141c0.094-0.094 0.234-0.156 0.359-0.156s0.266 0.063 0.359 0.156l0.781 0.781c0.094 0.094 0.156 0.234 0.156 0.359z"></path>
</symbol>
<symbol id="icon-point-right" viewBox="0 0 32 32">
<title>point-right</title>
<path class="path1" d="M13 30h5c1.654 0 3-1.346 3-3 0-0.535-0.14-1.037-0.387-1.472 0.833-0.534 1.387-1.467 1.387-2.528 0-0.768-0.29-1.469-0.766-2 0.476-0.531 0.766-1.232 0.766-2 0-0.35-0.060-0.687-0.171-1h7.171c1.654 0 3-1.346 3-3s-1.346-3-3-3h-12.334l2.932-5.501c0.262-0.454 0.401-0.973 0.401-1.499 0-1.654-1.346-3-3-3-0.824 0-1.592 0.327-2.163 0.922-0.007 0.008-0.015 0.015-0.022 0.023l-6.815 7.474v-1.419c0-0.552-0.448-1-1-1h-6c-0.552 0-1 0.448-1 1v20c0 0.552 0.448 1 1 1h6c0.552 0 1-0.448 1-1v-1.382l4.553 2.276c0.139 0.069 0.292 0.106 0.447 0.106zM5 28c-0.552 0-1-0.448-1-1s0.448-1 1-1 1 0.448 1 1-0.448 1-1 1zM13.236 28l-5.236-2.618v-11.995l8.287-9.088c0.19-0.193 0.443-0.299 0.713-0.299 0.551 0 1 0.449 1 1 0 0.171-0.041 0.332-0.122 0.479-0.010 0.017-0.020 0.033-0.029 0.051l-3.732 7c-0.165 0.31-0.156 0.684 0.025 0.985s0.506 0.485 0.857 0.485h14c0.551 0 1 0.449 1 1s-0.449 1-1 1h-10c-0.552 0-1 0.448-1 1s0.448 1 1 1c0.551 0 1 0.449 1 1s-0.449 1-1 1c-0.552 0-1 0.448-1 1s0.448 1 1 1c0.551 0 1 0.449 1 1s-0.449 1-1 1h-1c-0.552 0-1 0.448-1 1s0.448 1 1 1c0.551 0 1 0.449 1 1s-0.449 1-1 1h-4.764z"></path>
</symbol>
<symbol id="icon-point-left" viewBox="0 0 32 32">
<title>point-left</title>
<path class="path1" d="M19 30h-5c-1.654 0-3-1.346-3-3 0-0.535 0.14-1.037 0.386-1.472-0.833-0.534-1.386-1.467-1.386-2.528 0-0.768 0.29-1.469 0.766-2-0.476-0.531-0.766-1.232-0.766-2 0-0.35 0.060-0.687 0.171-1h-7.171c-1.654 0-3-1.346-3-3s1.346-3 3-3h12.334l-2.932-5.501c-0.262-0.454-0.401-0.973-0.401-1.499 0-1.654 1.346-3 3-3 0.824 0 1.592 0.327 2.163 0.921 0.007 0.008 0.015 0.015 0.022 0.023l6.815 7.474v-1.419c0-0.552 0.448-1 1-1h6c0.552 0 1 0.448 1 1v20c0 0.552-0.448 1-1 1h-6c-0.552 0-1-0.448-1-1v-1.382l-4.553 2.276c-0.139 0.069-0.292 0.106-0.447 0.106zM27 28c0.552 0 1-0.448 1-1s-0.448-1-1-1-1 0.448-1 1 0.448 1 1 1zM18.764 28l5.236-2.618v-11.995l-8.287-9.088c-0.19-0.193-0.443-0.299-0.713-0.299-0.551 0-1 0.449-1 1 0 0.171 0.041 0.332 0.122 0.479 0.010 0.017 0.020 0.033 0.029 0.051l3.732 7c0.165 0.31 0.156 0.684-0.025 0.985s-0.506 0.485-0.857 0.485h-14c-0.551 0-1 0.449-1 1s0.449 1 1 1h10c0.552 0 1 0.448 1 1s-0.448 1-1 1c-0.551 0-1 0.449-1 1s0.449 1 1 1c0.552 0 1 0.448 1 1s-0.448 1-1 1c-0.551 0-1 0.449-1 1s0.449 1 1 1h1c0.552 0 1 0.448 1 1s-0.448 1-1 1c-0.551 0-1 0.449-1 1s0.449 1 1 1h4.764z"></path>
</symbol>
</defs>
</svg>
`;
document.body.insertAdjacentHTML("afterBegin", SVG);