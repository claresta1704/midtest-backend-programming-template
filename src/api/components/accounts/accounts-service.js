const accountsRepository = require('./accounts-repository');
const { Account } = require('../../../models');
const { hashPin, pinMatched } = require('../../../utils/password');

/**
 * Get list of accounts
 * @returns {Array}
 */
async function getAccounts() {
  const accounts = await accountsRepository.getAccounts();

  const results = [];
  for (let i = 0; i < accounts.length; i += 1) {
    const account = accounts[i];
    results.push({
      id: account.id,
      name: account.name,
      email: account.email,
      noTelp: account.noTelp,
      noRek: account.noRek,
      saldo: account.saldo,
    });
  }

  return results;
}

/**
 * //Menghitung jumlah account keseluruhan
 * @returns {number}
 */
async function countAccounts() {
  const counted = await accountsRepository.getAccounts(); //kita pakai getAccount dulu, nanti dari getAccount dimasukkan lagi ke array baru
  let count = 0;
  for (let j = 0; j < counted.length; j++) {
    count = count + 1;
  }
  return count;
}

/**
 * search account
 * @param {string} destinationRek
 * @returns {Object}
 */
async function searchIdbynoRek(destinationRek) {
  const pengguna = await getAccounts();

  for (let i = 0; i < pengguna.length; i++) {
    //kita pakai getAccounts untuk mengambil semua data account dulu
    const searched = pengguna[i];
    if (searched.noRek.includes(destinationRek)) {
        return (searched.id);
    }
  }
}

/**
 * search account
 * @param {string} key
 * @returns {Array}
 */
async function searchAccounts(key) {
  const pengguna = await getAccounts();

  const hasil = [];
  for (let i = 0; i < pengguna.length; i++) {
    //kita pakai getAccounts untuk mengambil semua data account dulu
    const searched = pengguna[i];
    if (searched.name.includes(key)) {
      hasil.push({
        id: searched.id,
        name: searched.name,
        email: searched.email,
        noTelp: searched.noTelp,
    });
  }
  return hasil;
}
}

/**
 * sort
 * @param {Array} array
 * @param {string} field
 * @param {string} sort_order
 * @returns {Array}
 */
async function sort(array, field, sort_order) {
  const sorted = accountsRepository.sort(array, field, sort_order); //memanggil fungsi sort di accountsRepository
  return sorted;
}

/**
 * Get account detail
 * @param {string} id - Account ID
 * @returns {Object}
 */
async function getAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  return {
    id: account.id,
    name: account.name,
    email: account.email,
    noTelp: account.noTelp,
    noRek: account.noRek,
    saldo: account.saldo,
  };
}

/**
 * fungsi untuk membuat nomor rekening acak 10 angka
 * @returns {string}
 */
function randomRekening() {
  const noRek = Math.floor(1000000000 + Math.random() * 90000000000);
  return noRek.toString();
}

/**
 * Create new account
 * @param {string} name - Name
 * @param {string} mothers_name - nama ibu kandung
 * @param {string} email - email
 * @param {string} noTelp - nomor telepon
 * @param {string} pin - pin
 * @returns {boolean}
 */
async function createAccount(name, mothers_name, email, noTelp, pin) {
  // Hash pin
  const hashedPin = await hashPin(pin);
  const noRek = randomRekening();
  const saldo = 0;

  try {
    await accountsRepository.createAccount(
      name,
      mothers_name,
      email,
      noTelp,
      hashedPin,
      noRek,
      saldo
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing account
 * @param {string} id - Account ID
 * @param {string} noTelp
 * @returns {boolean}
 */
async function updateNoTelp(id, noTelp) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.updateNoTelp(
      id,
      noTelp
    );
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete account
 * @param {string} id - Account ID
 * @returns {boolean}
 */
async function deleteAccount(id) {
  const account = await accountsRepository.getAccount(id);

  // Account not found
  if (!account) {
    return null;
  }

  try {
    await accountsRepository.deleteAccount(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Fungsi untuk transfer uang
 * @param {string} id
 * @param {string} destinationAccount
 * @param {string} amount
 * @returns {boolean}
 */
async function transferMoney(id, destinationAccount, amount) { //lebih fokus ke rekening yang akan ditransfer, saldonya akan bertambah
  const destinationId = await searchIdbynoRek(destinationAccount);
  const status = 'top up';
  const berhasil = await tambahKurangSaldo(destinationId, status, amount);
  if(!berhasil){
    return null;
  }
  return true;
}

/**
 * Check whether the email is registered
 * @param {string} noTelp - Email
 * @returns {boolean}
 */
async function noTelpIsRegistered(noTelp) {
  const account = await accountsRepository.getAccountBynoTelp(noTelp);

  if (account) {
    return true;
  }

  return false;
}

/**
 * cek saldo
 * @param {string} id
 * @returns {Object}
 */
async function cekSaldo(id){
  const idRegistered = await accountsRepository.getAccount(id);
  if(!idRegistered){
    return null;
  }
  return idRegistered.saldo;
}

/**
 * mengelola tambah dan kurang saldo
 * @param {string} id
 * @param {string} status
 * @param {number} amount
 * @return {boolean}
 */
async function tambahKurangSaldo(id, status, amount){
  const account = await accountsRepository.getAccount(id)
  if(!account){
    return null;
  }
  let newnew;
  if(status == 'transfer'){
    newnew = account.saldo - amount;
  }else if(status == 'top up'){
    newnew = account.saldo + amount;
  }else{
    return null
  }

  const success = await accountsRepository.tambahKurangSaldo(id, newnew);
  if(!success){
    return null;
  }
  return true;
}

/**
 * Check whether the password is correct
 * @param {string} id - Account ID
 * @param {string} pin - Password
 * @returns {boolean}
 */
async function isPinWrong(id, pin) {
  const account = await accountsRepository.getAccount(id);
  return pinMatched(pin, account.pin);
}

/**
 * Change account password
 * @param {string} accountId - Account ID
 * @param {string} pin - Password
 * @returns {boolean}
 */
async function changePassword(accountId, pin) {
  const account = await accountsRepository.getAccount(accountId);

  // Check if account not found
  if (!account) {
    return null;
  }

  const hashedPin = await hashPin(pin);

  const changeSuccess = await accountsRepository.changePassword(
    accountId,
    hashedPin
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

module.exports = {
  getAccounts,
  countAccounts,
  getAccount,
  searchAccounts,
  transferMoney,
  cekSaldo,
  isPinWrong,
  sort,
  createAccount,
  updateNoTelp,
  deleteAccount,
  noTelpIsRegistered,
  tambahKurangSaldo,
  searchIdbynoRek,
  changePassword,
};
