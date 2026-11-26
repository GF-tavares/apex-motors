# Créditos e origem dos assets

## Fotografias

Todas as fotos vêm do [Unsplash](https://unsplash.com) e foram baixadas pelo endpoint público do site, excluindo imagens Unsplash+ (pagas, com marca d'água). A [licença do Unsplash](https://unsplash.com/license) permite uso gratuito, inclusive comercial, sem exigir atribuição; os créditos abaixo são cortesia.

Os originais ficam em `assets-src/` (fora do Git). O script `scripts/process-images.py` aplica o tratamento de cor e grava as versões usadas em `src/assets/`; o Astro gera AVIF e WebP em várias larguras no build.

Tratamento aplicado: escuro e dessaturado, preservando só os vermelhos; pretos esmagados e vinheta leve.

| Arquivo em `src/assets/automotivo/` | Autor | Foto no Unsplash |
| --- | --- | --- |
| `hero-911-perfil` | [noir.](https://unsplash.com/@noirmedia) | [N3p9BsO-6E4](https://unsplash.com/photos/a-grey-sports-car-parked-in-front-of-a-building-N3p9BsO-6E4) |
| `gts-lanterna` | [Asdrubal luna](https://unsplash.com/@infectedluna) | [GqbSYjxkWvk](https://unsplash.com/photos/red-and-black-car-tail-light-GqbSYjxkWvk) |
| `est-911` | [Yannic Alexander](https://unsplash.com/@yalexander) | [OqZmrFezSEI](https://unsplash.com/photos/a-black-sports-car-parked-on-the-side-of-the-road-OqZmrFezSEI) |
| `est-m3` | [Noam Cohen](https://unsplash.com/@semineural) | [OSHaoEjkj4M](https://unsplash.com/photos/a-white-car-parked-in-a-parking-garage-OSHaoEjkj4M) |
| `est-amg` | [Anil Baki Durmus](https://unsplash.com/@anldrms) | [ZufLZRfOrIM](https://unsplash.com/photos/a-black-mercedes-sports-car-parked-in-a-garage-ZufLZRfOrIM) |
| `est-rs6` | [serjan midili](https://unsplash.com/@s_midili) | [8iZdhhP5bwg](https://unsplash.com/photos/black-bmw-m-3-coupe-parked-on-gray-pavement-8iZdhhP5bwg) |
| `hero-911-noite` | [Franco Debartolo](https://unsplash.com/@francotheshooter) | [Y1wL87Fc4D4](https://unsplash.com/photos/a-black-sports-car-driving-down-a-street-at-night-Y1wL87Fc4D4) |
| `est-taycan` | [Samuel Hagger](https://unsplash.com/@samuel_hagger) | [Zn3Fnrt5dvk](https://unsplash.com/photos/a-silver-car-driving-down-a-street-next-to-a-forest-Zn3Fnrt5dvk) |
| `est-m4` | [Mathew Antony](https://unsplash.com/@martuflex) | [5d_suG52k0w](https://unsplash.com/photos/the-front-of-a-black-car-with-its-lights-on-5d_suG52k0w) |
| `det-brasao` | [Mathis Mauprivez](https://unsplash.com/@mathisvisuals) | [HfRu8KQnSK4](https://unsplash.com/photos/porsche-emblem-on-a-dark-car-surface-HfRu8KQnSK4) |
| `det-amg` | [Nothing ToC](https://unsplash.com/@nothingtoc) | [6Yuq2UEstnU](https://unsplash.com/photos/a-close-up-of-a-car-6Yuq2UEstnU) |
| `det-m4` | [Mathew Antony](https://unsplash.com/@martuflex) | [QZVGfAbepFc](https://unsplash.com/photos/a-black-sports-car-with-yellow-lights-on-it-QZVGfAbepFc) |
| `det-911-rua` | [Samuel Hagger](https://unsplash.com/@samuel_hagger) | [n1MyGFiSVYs](https://unsplash.com/photos/a-gray-porsche-car-is-driving-on-a-city-street-n1MyGFiSVYs) |

## Tipografia

Servidas pelo próprio site via `@fontsource-variable`, licença **SIL Open Font License 1.1**: Archivo (eixo de largura) e JetBrains Mono.

## Marcas e conteúdo

Apex Motors é uma marca fictícia criada para portfólio. Pessoas, números, preços e endereços são ilustrativos; os contatos usam o domínio reservado `.example`. Porsche, BMW, Mercedes-AMG e Audi são marcas de seus fabricantes, citadas apenas para compor o estoque demonstrativo.

## Histórico

O projeto começou com três demos (advocacia, automotivo, clínica) e uma galeria. Em 2026-09-24, a pedido do Gustavo, advocacia e clínica foram descartadas (movimento excessivo, partes estranhas na clínica); ficou só a Apex Motors, que virou a página única do portfólio.
