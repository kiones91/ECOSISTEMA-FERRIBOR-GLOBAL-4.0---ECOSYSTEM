<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">

    <!-- Bootstrap -->
    <link rel="stylesheet" type="text/css"  href="https://maxcdn.bootstrapcdn.com/bootstrap/3.3.7/css/bootstrap.min.css">

    <style>
        @import url(https://fonts.googleapis.com/css?family=Lato:100,300,400,700,900,100italic,300italic,400italic,700italic,900italic);
        @import url(https://fonts.googleapis.com/css?family=Open+Sans:300italic,400italic,600italic,700italic,800italic,700,300,600,800,400);

        body, html{
            font-family: 'Lato', sans-serif;
            text-rendering: optimizeLegibility !important;
            -webkit-font-smoothing: antialiased !important;
            color: #000000;
            background-color: transparent;
        }

        table.default-table {
            width: 100%;
            background-color: transparent;
        }

        table thead,
        table.default-table thead {
            border-bottom: 1px solid gray;
        }

        table thead th,
        table.default-table thead th {
            font-weight: 600;
            font-size: 12px;
            line-height: 23px;
            padding: 8px 5px;
            color: gray;
            text-transform: uppercase;
            text-align: right
        }

        table thead th:first-child,
        table.default-table thead th:first-child {
            text-align: left
        }

        table tbody tr,
        table.default-table tbody tr {
            background-color: transparent
        }

        table tbody tr:hover,
        table.default-table tbody tr:hover {
            background-color: #e9e9e9
        }

        table tbody td,
        table.default-table tbody td {
            font-weight: 400;
            font-size: 12px;
            line-height: 24px;
            color: gray;
            padding: 8px 5px;
            text-align: right;
            border-bottom: 1px solid rgba(108, 117, 125, .24)
        }

        table tbody td:first-child,
        table.default-table tbody td:first-child {
            text-align: left
        }

        table tbody td.dual span:nth-child(2),
        table.default-table tbody td.dual span:nth-child(2) {
            font-size: 12px;
            line-height: 16px;
            color: #6c757d
        }

        table tbody td.positive,
        table.default-table tbody td.positive {
            color: #1eb980
        }

        table tbody td.negative,
        table.default-table tbody td.negative {
            color: #ff5252
        }

        table tbody td.negative,
        table tbody td.positive,
        table.default-table tbody td.negative,
        table.default-table tbody td.positive {
            font-weight: 600
        }
    </style>
</head>

<body>
<article id="topo">
    <header>
        
        <div id="container_table">
            <table class="default-table">
                <thead>
                <tr>
                    <th>Moeda</th>
                    <th></th>
                    <th>Compra</th>
                    <th>Venda</th>
                    <th>Var(%)</th>
                </tr>
                </thead>
                <tbody>
                <tr>
                    <td>Bitcoin</td>
                    <td><img src="https://conton.com.br/cotacao/bit.webp" width="50px" alt="Bitcoin" /></td>
                    <td>R$ 324740</td>
                    <td>R$ 324763</td>
                    <td class="positive">2.298</td>
                </tr>
                <tr>
                    <td>Dólar Turismo</td>
                    <td><img src="https://conton.com.br/cotacao/eua.webp" width="50px" alt="Dólar Turismo" /></td>
                    <td>R$ 5,1506</td>
                    <td>R$ 5,3101</td>
                    <td class="negative">-1.506111</td>
                </tr>
                <tr>
                    <td>Dólar Comercial</td>
                    <td><img src="https://conton.com.br/cotacao/eua.webp" width="50px" alt="Dólar Comercial" /></td>
                    <td>R$ 5,1140</td>
                    <td>R$ 5,1170</td>
                    <td class="negative">-1.506109</td>
                </tr>
                <tr>
                    <td>Euro</td>
                    <td><img src="https://conton.com.br/cotacao/euro.webp" width="50px" alt="Euro" /></td>
                    <td>R$ 5,9172</td>
                    <td>R$ 5,9312</td>
                    <td class="negative">-1.124246</td>
                </tr>
                <tr>
                    <td>Peso Argentino</td>
                    <td><img src="https://conton.com.br/cotacao/arg.webp" width="50px" alt="Peso Argentino" /></td>
                    <td>R$ 0,0036</td>
                    <td>R$ 0,0036</td>
                    <td class="negative">-1.453087</td>
                </tr>
                <tr>
                    <td>Peso Chileno</td>
                    <td><img src="https://conton.com.br/cotacao/chi.webp" width="50px" alt="Peso Chileno" /></td>
                    <td>R$ 0,0056</td>
                    <td>R$ 0,0056</td>
                    <td class="negative">-0.212618</td>
                </tr>
                <tr>
                    <td>Peso Mexicano</td>
                    <td><img src="https://conton.com.br/cotacao/mex.webp" width="50px" alt="Peso Mexicano" /></td>
                    <td>R$ 0,2963</td>
                    <td>R$ 0,2970</td>
                    <td class="negative">-0.486774</td>
                </tr>
                </tbody>
            </table>
        </div>
    </header>
</article>

</body>

</html>