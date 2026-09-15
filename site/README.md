# 미리보기 사이트 / 预览网站

[`index.html`](index.html) 한 파일로 된 정적 미리보기입니다.
`chengyu/`의 사자성어 노트를 카드 목록 + 펼침 상세로 보여줍니다.

## 주의 — 자동 갱신되지 않습니다

이 페이지의 데이터는 `index.html` 안의 `DATA` 배열에 **직접 박혀 있습니다.**
`chengyu/*.md`를 고쳐도 이 페이지는 바뀌지 않습니다.

`scripts/build-index.js`가 갱신하는 것은 `chengyu/README.md`의 표이지 이 페이지가 아닙니다.
md 파일에서 자동으로 생성되게 하려면 6단계(GitHub Pages 전환)에서 빌드 과정을 붙여야 합니다.

## GitHub Pages로 공개하려면

저장소 **Settings → Pages → Source**에서 `main` 브랜치 / `/site` 폴더를 선택하면
`https://hdj82-bot.github.io/hanzi1/` 로 열립니다. (저장소 설정이라 웹에서 직접 해야 합니다.)
