curl -L -X POST 'https://app.sentio.xyz/api/v1/insights/meson/cross-chain-bridges/query' \
     -H 'api-key: Py1cocDmn1Kknz9I23FJbSzSyxG0r7fdH' \
     -H 'Content-Type: application/json' \
     --data-raw '{
  "timeRange": {
    "start": "-30d",
    "end": "now",
    "step": 3600,
    "timezone": "Asia/Shanghai"
  },
  "limit": 20,
  "queries": [
    {
      "metricsQuery": {
        "query": "swapInAmount",
        "alias": "Celer, -> Zksync ({{token}})",
        "id": "a",
        "labelSelector": {
          "contract_name": "CBridge",
          "dst": "zksync era",
          "token": "USDC"
        },
        "aggregate": {
          "op": "SUM",
          "grouping": [
            "chain",
            "token"
          ]
        },
        "functions": [
          {
            "name": "rollup_count",
            "arguments": [
              {
                "durationValue": {
                  "value": 1,
                  "unit": "d"
                }
              }
            ]
          }
        ],
        "disabled": false
      },
      "dataSource": "METRICS",
      "sourceName": ""
    }
  ],
  "formulas": [
    {
      "expression": "",
      "alias": "",
      "id": "",
      "disabled": false,
      "functions": []
    }
  ]
}'

curl -L -X POST 'https://app.sentio.xyz/api/v1/insights/meson/cross-chain-bridges/query' \
     -H 'api-key: Py1cocDmn1Kknz9I23FJbSzSyxG0r7fdH' \
     -H 'Content-Type: application/json' \
     --data-raw '{
  "timeRange": {
    "start": "-30d",
    "end": "now",
    "step": 3600,
    "timezone": "Asia/Shanghai"
  },
  "limit": 20,
  "queries": [
    {
      "metricsQuery": {
        "query": "swapInAmount",
        "alias": "Celer, -> Zksync ({{token}})",
        "id": "a",
        "labelSelector": {
          "contract_name": "CBridge",
          "dst": "zksync era",
          "token": "USDC"
        },
        "aggregate": {
          "op": "SUM",
          "grouping": [
            "chain",
            "token"
          ]
        },
        "functions": [
          {
            "name": "rollup_sum",
            "arguments": [
              {
                "durationValue": {
                  "value": 1,
                  "unit": "d"
                }
              }
            ]
          }
        ],
        "disabled": false
      },
      "dataSource": "METRICS",
      "sourceName": ""
    }
  ],
  "formulas": [
    {
      "expression": "",
      "alias": "",
      "id": "",
      "disabled": false,
      "functions": []
    }
  ]
}'

curl -L -X POST 'https://app.sentio.xyz/api/v1/insights/meson/cross-chain-bridges/query' \
     -H 'api-key: Py1cocDmn1Kknz9I23FJbSzSyxG0r7fdH' \
     -H 'Content-Type: application/json' \
     --data-raw '{
  "timeRange": {
    "start": "-30d",
    "end": "now",
    "step": 3600,
    "timezone": "Asia/Shanghai"
  },
  "limit": 20,
  "queries": [
    {
      "metricsQuery": {
        "query": "swapOutType",
        "alias": "Celer, <- Zksync ({{token}})",
        "id": "a",
        "labelSelector": {
          "contract_name": "CBridge",
          "src": "zksync era",
          "token": "USDC"
        },
        "aggregate": {
          "op": "SUM",
          "grouping": [
            "chain",
            "token"
          ]
        },
        "functions": [
          {
            "name": "rollup_count",
            "arguments": [
              {
                "durationValue": {
                  "value": 1,
                  "unit": "d"
                }
              }
            ]
          }
        ],
        "disabled": false
      },
      "dataSource": "METRICS",
      "sourceName": ""
    }
  ],
  "formulas": [
    {
      "expression": "",
      "alias": "",
      "id": "",
      "disabled": false,
      "functions": []
    }
  ]
}'

curl -L -X POST 'https://app.sentio.xyz/api/v1/insights/meson/cross-chain-bridges/query' \
     -H 'api-key: Py1cocDmn1Kknz9I23FJbSzSyxG0r7fdH' \
     -H 'Content-Type: application/json' \
     --data-raw '{
  "timeRange": {
    "start": "-30d",
    "end": "now",
    "step": 3600,
    "timezone": "Asia/Shanghai"
  },
  "limit": 20,
  "queries": [
    {
      "metricsQuery": {
        "query": "swapOutAmount",
        "alias": "Celer, <- Zksync ({{token}})",
        "id": "a",
        "labelSelector": {
          "contract_name": "CBridge",
          "src": "zksync era",
          "token": "USDC"
        },
        "aggregate": {
          "op": "SUM",
          "grouping": [
            "chain",
            "token"
          ]
        },
        "functions": [
          {
            "name": "rollup_sum",
            "arguments": [
              {
                "durationValue": {
                  "value": 1,
                  "unit": "d"
                }
              }
            ]
          }
        ],
        "disabled": false
      },
      "dataSource": "METRICS",
      "sourceName": ""
    }
  ],
  "formulas": [
    {
      "expression": "",
      "alias": "",
      "id": "",
      "disabled": false,
      "functions": []
    }
  ]
}'