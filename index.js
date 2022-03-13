mobx.configure({ useProxies: "never" });



var util = {
  // ES5でgetアクセサを使うため。。
  get: function (object, name, fn) {
    Object.defineProperty(object, name, { get: fn });
  }
}



var Form = (function(initialState) {
  var Form = function(initialState) {
    this.state = initialState;
    mobx.makeAutoObservable(this);
  }

  var p = Form.prototype;

  p.updateState = function (fn) {
    this.state = fn(this.state);
  }

  p.updateValue = function (name, value) {
    this.state[name].value = value;
  }

  p.updateChecked = function (name, checked) {
    this.state[name].checked = checked;
  }

  /**
   * 入力した値によって何かする場合、以下のように追加していく
   */
  util.get(p, 'isHoge', function () {
    return this.state['email'].value === 'hoge' && this.state['password'].value === 'fuga';
  });
  util.get(p, 'isFuga', function () {
    return this.state['check'].checked && this.state['password'].value === 'fuga';
  });

  return Form;
})();



$(function () {

  /**
   * 初期状態を作成する。
   * jQueryではDOMから状態を作成する必要がある。。。
   */
  var state = {};
  $('#sample-form [name]').each(function () {
    var $this = $(this);
    var name  = $this.attr('name');
    var type  = $this.attr('type');
    var value   = '';
    var checked = undefined;

    /**
     * チェックボックスの場合 Boolean で制御する
     */
    if (type === 'checkbox') {
      checked = $this.prop('checked');
    }

    /**
     * ラジオボタンの場合 Boolean方 で制御する
     */
    else if (type === 'radio') {
      checked = $this.prop('checked');
    }

    /**
     * 上記以外は　String型 で制御する
     */
    else {
      value = $this.val();
    }

    state[name] = {
      value: value,
      checked: checked
    }
  });



  /**
   * 作った状態をStoreに渡す
   */
  var form = new Form(state);



  /**
   * DOMに 状態を変更（MobxのActionのこと）する イベントを登録
   */
  var handler = {
    updateValue: function (e) {
      var name = $(this).attr('name');
      form.updateValue(name, e.target.value);
    },

    updateChecked: function (e) {
      var name = $(this).attr('name');
      form.updateChecked(name, e.target.checked);
    }
  }
  $('[name="email"]').on('input', handler.updateValue);
  $('[name="password"]').on('input', handler.updateValue);
  $('[name="address1"]').on('input', handler.updateValue);
  $('[name="address2"]').on('input', handler.updateValue);
  $('[name="city"]').on('input', handler.updateValue);
  $('[name="state"]').on('input', handler.updateValue);
  $('[name="zip"]').on('input', handler.updateValue);
  $('[name="check"]').on('input', handler.updateChecked);



  /**
   * Address1 が変更されたときの処理
   */
  mobx.autorun(function () {
    console.log('Address1: ' + form.state.address1.value);
  });

  /**
   * Address2 が変更されたときの処理
   */
  mobx.autorun(function () {
    console.log('Address2: ' + form.state.address2.value);
  });

  /**
   * フォームの状態が変更されたときの処理
   */
  mobx.autorun(function () {
    updateFormStatus(form.state);
  });



  // 状態の変更を視覚化（おまけ）
  function updateFormStatus(state) {
    if (!state) {
      return;
    }

    var template = [];

    // form.state の中身を表示
    Object.keys(state).forEach(function (key) {
      var text = '';
      if (state[key].checked !== undefined) {
        text = '<span class="fw-bold">Name:</span> '+ key +'<br><span class="fw-bold">checked:</span> '+ state[key].checked;
      } else {
        text = '<span class="fw-bold">Name:</span> '+ key +'<br><span class="fw-bold">value:</span> '+ state[key].value;
      }
      template.push('<p class="card-text">'+ text +'</p>');
    });

    template.push('<p class="card-text"><span class="fw-bold">emailがhoge、passwordがfuga</span><br>'+ form.isHoge +'</p>');
    template.push('<p class="card-text"><span class="fw-bold">Check me outがchecked, passwordがfuga</span><br>'+ form.isFuga +'</p>');

    template = template.join('');
    $('[data-form-status]').html($(template));
  }
  updateFormStatus();

});
